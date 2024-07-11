import nodemail from 'nodemailer';
import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from '../../lib/prisma';
import { getEmailClient } from '../../lib/mail';
import { dayjs } from "../../lib/dayjs";

export async function confirmParticipants(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/participants/:participantid/confirm', {
        schema:
        {
            params: z.object({
                participantid: z.string().uuid(),
            })
        }
    }, async (req, res) => {
        const { participantid } = req.params;

        const participant = await prisma.participant.findUnique({
            where: { id: participantid }
        })

        if (!participant) {
            throw new Error('Participant not found')
        }

        if (participant.is_confirmed) {
            return res.redirect('http://localhost:8000')
        }

        await prisma.participant.update({
            where: {
                id: participantid
            },
            data: {
                is_confirmed: true
            }
        })
        
        return res.redirect('http://localhost:8000')
    });
}