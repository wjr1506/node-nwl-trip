import nodemail from 'nodemailer';
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from 'zod';
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getEmailClient } from "../../lib/mail";
import { dayjs } from '../../lib/dayjs';

export async function createActivity(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activites', {
        schema:
        {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                title: z.string().min(4),
                occurs_at: z.coerce.date(),

            })
        }
    }, async (req, res) => {
        const { tripId } = req.params;
        const { title, occurs_at } = req.body;

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
        });

        if (!trip) {
            throw new Error('Trip not found');
        }

        if (dayjs(occurs_at).isBefore(trip.starts_at)) {
            throw new Error('Ivalid date')
        }

        if (dayjs(occurs_at).isAfter(trip.ends_at)) {
            throw new Error('Ivalid date')
        }

        const activity = await prisma.activity.create({
            data: {
                title,
                occurs_at,
                trip_id: tripId
            }
        })

        return { activityId: activity.id }
    });
}