// backend/packages/kafka/src/client.ts
import { Kafka, type KafkaConfig } from "kafkajs";

/**
 * Xây KafkaConfig dựa trên env:
 * - KAFKA_BROKERS: "host1:port,host2:port"
 * - KAFKA_SSL_ENABLED: "true" | "false"
 * - KAFKA_SSL_CA / KAFKA_SSL_CERT / KAFKA_SSL_KEY: PEM (có thể dùng \n hoặc xuống dòng thật)
 */
const buildKafkaConfig = (clientId: string): KafkaConfig => {
  // Nếu không set KAFKA_BROKERS thì fallback localhost (dev docker)
  const brokersEnv =
    process.env.KAFKA_BROKERS ??
    "127.0.0.1:9094,127.0.0.1:9095,127.0.0.1:9096";

  const brokers = brokersEnv
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  const sslEnabled = process.env.KAFKA_SSL_ENABLED === "true";

  let ssl: KafkaConfig["ssl"] = undefined;

  if (sslEnabled) {
    // Hỗ trợ kiểu value chứa '\n' trong env (thường dùng trên cloud)
    const ca = process.env.KAFKA_SSL_CA?.replace(/\\n/g, "\n");
    const cert = process.env.KAFKA_SSL_CERT?.replace(/\\n/g, "\n");
    const key = process.env.KAFKA_SSL_KEY?.replace(/\\n/g, "\n");

    ssl = {
      rejectUnauthorized: true,
      ca: ca ? [ca] : undefined,
      cert,
      key,
    };
  }

  return {
    clientId,
    brokers,
    ssl,
  };
};

export const createKafkaClient = (service: string) => {
  return new Kafka(buildKafkaConfig(service));
};
