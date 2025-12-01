
import { Order } from "@repo/order-db";
import type { OrderType } from "@repo/types";

export const createOrder = async (payload: OrderType) => {
  const newOrder = new Order(payload);

  try {
    const savedOrder = await newOrder.save();
    return savedOrder;
  } catch (error) {
    console.error("eror creating order:", error);
    throw error;
  }
};
