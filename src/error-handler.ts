import type { FastifyInstance, FastifyError } from "fastify"
import { ClientError } from "./errors/client-erros"
import { ZodError } from "zod"

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, req, res) => {

    if (error instanceof ZodError){
        res.status(400).send({
            message: "invalid input",
            errors: error.flatten().fieldErrors
        })
    }

    if (error instanceof ClientError) {
        res.status(400).send({
            message: error.message
        })
    }
    return res.status(500).send({ message: 'Internal server error' })
}