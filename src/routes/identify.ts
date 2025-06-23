import express from "express";
import { identifyContact } from "../services/identifyService";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    const result = await identifyContact(email, phoneNumber);
    res.status(200).json({ contact: result });
  } catch (err) {
    console.error("Error identifying contact:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
