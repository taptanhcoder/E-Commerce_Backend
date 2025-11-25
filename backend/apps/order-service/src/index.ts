import Fastify from 'fastify'


const fastify = Fastify({
  logger: true
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