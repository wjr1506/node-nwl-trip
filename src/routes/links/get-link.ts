import nodemail from 'nodemailer';
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from 'zod';
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getEmailClient } from "../../lib/mail";
import { dayjs } from '../../lib/dayjs';

export async function getLink(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/links', {
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
            include: { links: true }
        });

        if (!trip) {
            throw new Error('Trip not found');
        }

        return { links: trip.links }
    });
}