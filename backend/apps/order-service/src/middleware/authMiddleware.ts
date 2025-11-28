import { FastifyRequest,FastifyReply } from "fastify";
import { clerkPlugin, getAuth } from "@clerk/fastify";

declare module "fastify"{
    interface FastifyRequest {
        userId? :string;
    }
}

export const shouldBeUser = async(request: FastifyRequest, reply: FastifyReply)=>{
  const { userId } = getAuth(request);

  if (!userId) {
    return reply.status(401).send({ message: "you are not logged in!" });
  }

  request.userId =userId;
}