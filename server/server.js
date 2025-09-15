import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import connectingDB from "./config/db.js";
import chatRouter from "./routes/chatRoutes.js";
import msgRouter from "./routes/messageRoutes.js";
import creditRouter from "./routes/creditRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect DB
connectingDB()

// strpie webhooks
app.post('/api/stripe',express.raw({type: 'application/json'}),stripeWebhooks)

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use('/api/chat',chatRouter)
app.use('/api/msg',msgRouter)
app.use('/api/credit',creditRouter)

app.listen(PORT, () => {
  console.log(`listening on the port of ${PORT}`);
});
