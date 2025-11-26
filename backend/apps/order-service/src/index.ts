import Fastify from 'fastify'


const fastify = Fastify({
  logger: true
})

fastify.get ("/health", (request,reply ) =>{
    return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
})


const start = async () => {
  try {
    await fastify.listen({ port: 8001 });
    console.log(" order service is running on port 8001")
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()