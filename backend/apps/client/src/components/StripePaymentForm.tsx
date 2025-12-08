"use client";

import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { CartItemsType, ShippingFormInputs } from "@repo/types";
import CheckoutForm from "./CheckoutForm";
import useCartStore from "@/stores/cartStore";


const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const fetchClientSecret = async (cart: CartItemsType, token: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-checkout-session`,
    {
      method: "POST",
      body: JSON.stringify({ cart }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  let json: any;
  try {
    json = await res.json();
  } catch (e) {
    console.error(
      "[StripePaymentForm] Failed to parse JSON from /create-checkout-session",
      e
    );
    throw e;
  }

  console.log(
    "[StripePaymentForm] Response from /create-checkout-session:",
    res.status,
    json
  );

  if (!res.ok) {
    // Backend báo lỗi (401 / 403 / 500 ...)
    throw new Error(
      json?.error || `Failed to create checkout session (${res.status})`
    );
  }

  const clientSecret = json.checkoutSessionClientSecret;

  if (!clientSecret || typeof clientSecret !== "string") {
    // Đây chính là case Stripe đã báo `resolved with undefined`
    throw new Error(
      `Invalid checkoutSessionClientSecret from backend: ${JSON.stringify(
        json
      )}`
    );
  }

  return clientSecret;
};

const StripePaymentForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const { cart } = useCartStore();
  const [token, setToken] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    getToken().then((t) => setToken(t ?? null));
  }, [getToken]);

  if (!token) {
    return <div className="">Loading...</div>;
  }

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret: () => fetchClientSecret(cart, token),
      }}
    >
      <CheckoutForm shippingForm={shippingForm} />
    </CheckoutProvider>
  );
};

export default StripePaymentForm;
