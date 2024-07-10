import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";

export async function getTrips(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/list', {}, async () => {
        const trips = await prisma.trip.findMany();
        return trips
    });
}