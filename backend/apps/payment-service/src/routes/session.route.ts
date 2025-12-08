import { Hono } from "hono";
import stripe from "../utils/stripe";
import { shouldBeUser } from "../middleware/authMiddleware";
import { CartItemsType } from "@repo/types";

const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const userId = c.get("userId");

  try {
    const lineItems = cart.map((item) => {
  
      const unitAmount = item.price * 100;

      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        console.error(
          "[create-checkout-session] Invalid unit_amount for cart item",
          { itemId: item.id, price: item.price, unitAmount }
        );
        throw new Error(
          `Invalid price for product id=${item.id}, price=${item.price}`
        );
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      client_reference_id: userId,
      mode: "payment",
      ui_mode: "custom",
      return_url:
        "http://localhost:3002/return?session_id={CHECKOUT_SESSION_ID}",
    });

    console.log("[create-checkout-session] Created session:", session.id);

    if (!session.client_secret) {
      console.error(
        "[create-checkout-session] Stripe did not return client_secret",
        session
      );
      return c.json(
        { error: "Stripe did not return a client_secret" },
        500
      );
    }

    return c.json({
      checkoutSessionClientSecret: session.client_secret,
    });
  } catch (error) {
    console.error("[create-checkout-session] Stripe error", error);
    return c.json({ error: "Unable to create checkout session" }, 500);
  }
});

sessionRoute.get("/:session_id", async (c) => {
  const { session_id } = c.req.param();
  const session = await stripe.checkout.sessions.retrieve(
    session_id as string,
    {
      expand: ["line_items"],
    }
  );

  console.log("[get checkout session] ", session);

  return c.json({
    status: session.status,
    paymentStatus: session.payment_status,
  });
});

export default sessionRoute;
