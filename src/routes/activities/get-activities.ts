import nodemail from 'nodemailer';
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from 'zod';
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getEmailClient } from "../../lib/mail";
import { dayjs } from '../../lib/dayjs';

export async function getActivity(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activites', {
        schema:
        {
            params: z.object({
                tripId: z.string().uuid()
            })
        }
    }, async (req, res) => {
        const { tripId } = req.params;

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: { activities: { orderBy: { occurs_at: 'asc' } } }
        });

        if (!trip) {
            throw new Error('Trip not found');
        }

        const numberOfTravelDays = dayjs(trip.ends_at).diff(trip.starts_at, 'day')

        const activies = Array.from({ length: numberOfTravelDays + 1 }).map((_, i) => {
            return {
                date: dayjs(trip.starts_at).add(i, 'days').toDate(),
                activies: trip.activities.filter(activity => {
                    return dayjs(activity.occurs_at).isSame(dayjs(trip.starts_at).add(i, 'days'), 'day')
                })
            }
        })


        return { activies }
    });
}