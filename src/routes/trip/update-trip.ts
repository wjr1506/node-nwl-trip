import nodemail from 'nodemailer';
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from 'zod';
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getEmailClient } from "../../lib/mail";
import { dayjs } from '../../lib/dayjs';
import { ClientError } from '../../errors/client-erros';

export async function updateTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().put('/trips/:tripId', {
        schema:
        {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(),
                ends_at: z.coerce.date(),
            })
        }
    }, async (req, res) => {
        const { tripId } = req.params
        const { destination, starts_at, ends_at } = req.body

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

        if (dayjs(starts_at).isBefore(new Date())) {
            throw new ClientError('invalid trip start date')
        }

        if (dayjs(starts_at).isBefore(starts_at)) {
            throw new ClientError('invalid trip end date')
        }

        await prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                destination,
                starts_at,
                ends_at
            }
        })

        return { tripId: trip.id }
    });
}