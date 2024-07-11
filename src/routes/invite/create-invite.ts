import nodemail from 'nodemailer';
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from 'zod';
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getEmailClient } from "../../lib/mail";
import { dayjs } from '../../lib/dayjs';
import { ClientError } from '../../errors/client-erros';
import { env } from '../../env';

export async function createInvite(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invite', {
        schema:
        {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                email: z.string().email()
            })
        }
    }, async (req, res) => {
        const { tripId } = req.params;
        const { email } = req.body;

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: { activities: { orderBy: { occurs_at: 'asc' } } }
        });

        if (!trip) {
            throw new ClientError('Trip not found');
        }

        const participant = await prisma.participant.create({
            data: {
                email,
                trip_id: tripId
            }
        })


        const mail = await getEmailClient();

        const message = await mail.sendMail({
            from: { name: 'Wellinton', address: 'wellinton@gmail.com' },
            to: participant.email,
            subject: `Confirmação de Viagem para ${trip.destination}`,
            html: `
                    <div>
                    <p>${trip.destination}</p>
                    <p>inicio ${dayjs(trip.starts_at).format('LL')}</p>
                    <p>final ${dayjs(trip.ends_at).format('LL')}</p>
                    <p><a href="${env.API_BASE_URL}/participants/${participant.id}/confirm/">Confirmar vaga</p>
                    </div>
                    `.trim()
        });

        console.log(nodemail.getTestMessageUrl(message))

        return { participantId: participant.id }
    });
}