import prisma from "../utils/db";
// import { Contact } from "@prisma/client";

type ContactResponse = {
  primaryContatctId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
};

export const identifyContact = async (email?: string, phoneNumber?: string): Promise<ContactResponse> => {
  if (!email && !phoneNumber) {
    throw new Error("Either email or phoneNumber must be provided");
  }

  // 1. Fetch all matching contacts by email or phone number
  const matchingContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  let allContacts = [...matchingContacts];

  // ✅ ✅ ✅ Handle brand new user (no match at all)
  if (allContacts.length === 0) {
    const newPrimary = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "primary",
      },
    });

    return {
      primaryContatctId: newPrimary.id,
      emails: [newPrimary.email!],
      phoneNumbers: [newPrimary.phoneNumber!],
      secondaryContactIds: [],
    };
  }

  // 2. Get linked contacts (if matching records exist)
  const primaryIds = matchingContacts.map((c: any) =>
    c.linkPrecedence === "primary" ? c.id : c.linkedId
  );

  const rootId = Math.min(...(primaryIds as number[]));

  const linkedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: rootId },
        { linkedId: rootId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  allContacts = linkedContacts;

  // 3. Check if input email/phone are already known
  const hasEmail = email && allContacts.some(c => c.email === email);
  const hasPhone = phoneNumber && allContacts.some(c => c.phoneNumber === phoneNumber);

  // 4. If any new info, create a secondary contact
  let newContact = null;
  if (!hasEmail || !hasPhone) {
    const primary = allContacts.find((c: any) => c.linkPrecedence === "primary") || allContacts[0];
    newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primary.id,
        linkPrecedence: "secondary",
      },
    });
    allContacts.push(newContact);
  }

  // 5. Determine the primary contact (earliest created)
  const primaryContact = allContacts.find((c: any) => c.linkPrecedence === "primary") || allContacts[0];

  // 6. Build response
  const emails = Array.from(new Set([
    primaryContact.email,
    ...allContacts.filter(c => c.id !== primaryContact.id).map(c => c.email),
  ].filter(Boolean))) as string[];

  const phoneNumbers = Array.from(new Set([
    primaryContact.phoneNumber,
    ...allContacts.filter(c => c.id !== primaryContact.id).map(c => c.phoneNumber),
  ].filter(Boolean))) as string[];

  const secondaryContactIds = allContacts
    .filter(c => c.id !== primaryContact.id)
    .map(c => c.id);

  return {
    primaryContatctId: primaryContact.id,
    emails,
    phoneNumbers,
    secondaryContactIds,
  };
};
