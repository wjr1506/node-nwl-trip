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
import { getParticipants } from './routes/participant/get-participants';
import { createInvite } from './routes/invite/create-invite';
import { updateTrip } from './routes/trip/update-trip';
import { getTripDetails } from './routes/trip/get-trip-details';
import { getParticipant } from './routes/participant/get-participant';
import { errorHandler } from './error-handler';
import { env } from './env';
const app = fastify();

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(cors, {
    origin: '*'
})

app.setErrorHandler(errorHandler)

app.register(createTrip)
app.register(confirmTrip)
app.register(getTripDetails)
app.register(updateTrip)
app.register(confirmParticipants)
app.register(getParticipants)
app.register(getParticipant)
app.register(createActivity)
app.register(getActivity)
app.register(createLink)
app.register(getLink)
app.register(createInvite)

app.listen({ port: env.PORT }).then(() => {
    console.log(`server running on ${env.API_BASE_URL}`)
});