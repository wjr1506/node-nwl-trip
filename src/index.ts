import fastify from 'fastify';
import cors from '@fastify/cors';
import { createTrip } from './routes/trip/create-trip';
import { confirmTrip } from './routes/trip/confirm-trip';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { confirmParticipants } from './routes/participant/confirm-participant';
import { createActivity } from './routes/activities/create-activies';
import { getActivity } from './routes/activities/get-activities';
import { createLink } from './routes/links/create-links';
import { getLink } from './routes/links/get-link';
const app = fastify();

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(cors, {
    origin: '*'
})

app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipants)
app.register(createActivity)
app.register(getActivity)
app.register(createLink)
app.register(getLink)

app.listen({ port: 8000 }).then(() => {
    console.log('server running on http://localhost:8000')
});