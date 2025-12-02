import { Hono } from "hono";
import Stripe from "stripe";
import stripe from "../utils/stripe";


const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const webhookRoute = new Hono();

webhookRoute.get("/", (c) => {
  return c.json({
    status: "ok ",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});


webhookRoute.post("/stripe", async (c) => {

});

export default webhookRoute;