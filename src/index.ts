import express from "express";
import identifyRouter from "./routes/identify";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // to parse JSON bodies
app.use("/identify", identifyRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
