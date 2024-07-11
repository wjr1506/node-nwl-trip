import nodemail from 'nodemailer';
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from 'zod';
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ClientError } from '../../errors/client-erros';

export async function getTripDetails(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId', {
        schema:
        {
            params: z.object({
                tripId: z.string().uuid(),
            }),
        }
    }, async (req, res) => {
        const { tripId } = req.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }, include: {
                participants: { where: { is_owner: false } }
            }
        })

        if (!trip) {
            throw new ClientError('Trip not found')
        }

        return { trip }
    });
}