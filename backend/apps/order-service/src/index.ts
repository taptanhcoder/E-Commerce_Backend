import Fastify from "fastify";
import { clerkPlugin, getAuth } from "@clerk/fastify";

const fastify = Fastify({ logger: true });

fastify.register(clerkPlugin);

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

fastify.get("/test", (request, reply) => {
  const { userId } = getAuth(request);

  if (!userId) {
    return reply.status(401).send({ message: "you are not logged in!" });
  }

  return reply.send({ message: "Order service is authenticated!" });
});

const start = async () => {
  try {
    await fastify.listen({ port: 8001 });
    console.log("order service is running on port 8001");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
