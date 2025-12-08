import { consumer } from "./kafka";
import { createOrder } from "./order";

export const runKafkaSubscriptions = async () => {
  console.log("[order-service] Starting Kafka subscriptions...");

  await consumer.subscribe([
    {
      topicName: "payment.successful",
      topicHandler: async (message: any) => {
        try {
          console.log(
            "[order-service] Received message on payment.successful:",
            message
          );

          // Theo thiết kế producer, message = { value: {...} }
          const orderPayload =
            (message && (message as any).value) !== undefined
              ? (message as any).value
              : message;

          console.log(
            "[order-service] Creating order with payload:",
            orderPayload
          );

          await createOrder(orderPayload);

          console.log("[order-service] Order created successfully");
        } catch (err) {
          console.error(
            "[order-service] Error while processing payment.successful:",
            err
          );
        }
      },
    },
  ]);
};
