import { Hono } from "hono";
import Stripe from "stripe";
import stripe from "../utils/stripe";
import { producer } from "../utils/kafka";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const webhookRoute = new Hono();

webhookRoute.get("/", (c) => {
  return c.json({
    status: "ok webhook",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

webhookRoute.post("/stripe", async (c) => {
  const body = await c.req.text();
  const sig = c.req.header("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (error) {
    console.error("[webhook] Webhook verification failed!", error);
    return c.json({ error: "Webhook verification failed!" }, 400);
  }

  console.log("[webhook] Received event:", {
    id: event.id,
    type: event.type,
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("[webhook] checkout.session.completed for session:", {
        id: session.id,
        client_reference_id: session.client_reference_id,
        amount_total: session.amount_total,
        payment_status: session.payment_status,
        email: session.customer_details?.email,
      });

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      const payload = {
        userId: session.client_reference_id,
        email: session.customer_details?.email,
        amount: session.amount_total,
        status: session.payment_status === "paid" ? "success" : "failed",
        products: lineItems.data.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          price: item.price?.unit_amount,
        })),
      };

      console.log(
        "[webhook] Sending Kafka message payment.successful:",
        payload
      );

      try {
        await producer.send("payment.successful", { value: payload });
        console.log("[webhook] Kafka payment.successful sent");
      } catch (err) {
        console.error("[webhook] Failed to send Kafka message:", err);
      }

      break;
    }

    default:
      console.log("[webhook] Ignored event type:", event.type);
      break;
  }

  return c.json({ received: true });
});

export default webhookRoute;
