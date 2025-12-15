import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { fastifySwagger } from '@fastify/swagger'
import { fastifyCors } from '@fastify/cors'
import ScalarApiReference from '@scalar/fastify-api-reference'

import { listWebhooks } from './routes/list-webhooks.ts'
import { getWebhook } from './routes/get-webhook.ts'
import { deleteWebhook } from './routes/delete-webhook.ts'
import { captureWebhook } from './routes/capture-webhook.ts'
import { generateHandler } from './routes/generate-handler.ts'

import { env } from './env'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Webhook Inspector API',
      description: 'API for capturing and inspecting webhook requests',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: '/docs',
})

// Rotas
app.register(listWebhooks)
app.register(getWebhook)
app.register(deleteWebhook)
app.register(captureWebhook)
app.register(generateHandler)

// Captura qualquer erro e retorna 500
app.setErrorHandler((error, request, reply) => {
  console.error('🔥 API ERROR:', error)
  reply.status(500).send({ error: error.message })
})

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log('🔥 HTTP server running on http://localhost:3333!')
  console.log('📚 Docs available at http://localhost:3333/docs')
})
