import 'dayjs/locale/pt-br'
import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:id/confirm', {
        schema:
        {
            params: z.object({
                id: z.string().uuid(),
            })
        }
    }, async (req, res) => {
        const id = req.params.id;

        return { tripId: id }
    });
}