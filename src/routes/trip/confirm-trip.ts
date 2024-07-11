import nodemail from 'nodemailer';
import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from '../../lib/prisma';
import { getEmailClient } from '../../lib/mail';
import { dayjs } from "../../lib/dayjs";
import { ClientError } from '../../errors/client-erros';
import { env } from '../../env';

export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
        schema:
        {
            params: z.object({
                tripId: z.string().uuid(),
            })
        }
    }, async (req, res) => {
        const { tripId } = req.params;

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

        if (trip.is_confirmed) {
            return res.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
        }

        await prisma.trip.update(
            {
                where: { id: trip.id },
                data: { is_confirmed: true }
            }
        )

        const mail = await getEmailClient();

        await Promise.all(
            trip.participants.map(async (participant) => {
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

            })
        );

        return res.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
    });
}