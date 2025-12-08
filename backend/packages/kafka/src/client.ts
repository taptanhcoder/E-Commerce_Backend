import { Kafka, type KafkaConfig } from "kafkajs";

const buildKafkaConfig = (clientId: string): KafkaConfig => {
  const brokersEnv =
    process.env.KAFKA_BROKERS ??
    "127.0.0.1:9094,127.0.0.1:9095,127.0.0.1:9096";

  const brokers = brokersEnv.split(",").map((b) => b.trim()).filter(Boolean);

  const sslEnabled = process.env.KAFKA_SSL_ENABLED === "true";

  let ssl: KafkaConfig["ssl"] = undefined;

  if (sslEnabled) {
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
