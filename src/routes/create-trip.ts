import nodemail from 'nodemailer';
import dayjs from 'dayjs'
import dayJsFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from 'zod';
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getEmailClient } from "../lib/mail";

dayjs.locale('pt-br');
dayjs.extend(dayJsFormat);

export async function createTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/create', {
        schema:
        {
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(),
                ends_at: z.coerce.date(),
                owner_name: z.string(),
                owner_email: z.string().email(),
                emails_to_invite: z.array(z.string().email())
            })
        }
    }, async (req, res) => {
        const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite } = req.body

        if (dayjs(starts_at).isBefore(new Date())) {
            throw new Error('invalid trip start date')
        }

        if (dayjs(starts_at).isBefore(starts_at)) {
            throw new Error('invalid trip end date')
        }

        const trip = await prisma.trip.create({
            data: {
                destination: destination,
                starts_at: starts_at,
                ends_at: ends_at,
                participants: {
                    createMany: {
                        data: [
                            {
                                name: owner_name,
                                email: owner_email,
                                is_owner: true,
                                is_confirmed: true
                            },
                            ...emails_to_invite.map(email => {
                                return { email }
                            })
                        ]
                    }
                }
            }
        })

        const mail = await getEmailClient();

        const message = await mail.sendMail({
            from: { name: 'Wellinton', address: 'wellinton@gmail.com' },
            to: { name: owner_name, address: owner_email },
            subject: `Confirmação de Viagem para ${destination}`,
            html: `
            <div>
            <p>Olá ${owner_name}</p>
            <p>${destination}</p>
            <p>inicio ${dayjs(starts_at).format('LL')}</p>
            <p>final ${dayjs(ends_at).format('LL')}</p>
            <p><a href="http://localhost:8000/trips/${trip.id}/confirm">Confirmar vaga</p>
            </div>
            `.trim()
        });

        console.log(nodemail.getTestMessageUrl(message))

        return { tripId: trip.id }
    });
}