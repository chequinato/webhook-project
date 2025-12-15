import { db } from '@/db'
import { webhooks } from '@/db/schema'
import { desc, lt } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const listWebhooks: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/webhooks',
    {
      schema: {
        summary: 'List webhooks',
        tags: ['Webhooks'],
        querystring: z.object({
          limit: z.coerce.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        }),
        response: {
          200: z.object({
            webhooks: z.array(
              createSelectSchema(webhooks).pick({
                id: true,
                method: true,
                pathname: true,
                createdAt: true,
              })
            ),
            nextCursor: z.string().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { limit, cursor } = request.query

      // Cria a query base
      let query = db
        .select({
          id: webhooks.id,
          method: webhooks.method,
          pathname: webhooks.pathname,
          createdAt: webhooks.createdAt,
        })
        .from(webhooks)
        .orderBy(desc(webhooks.id))
        .limit(limit + 1)

      // Aplica filtro se houver cursor
      if (cursor) {
        query = query.where(lt(webhooks.id, cursor))
      }

      const result = await query

      // Paginação
      const hasMore = result.length > limit
      const items = hasMore ? result.slice(0, limit) : result
      const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null

      // Retorna garantindo formato correto
      return reply.send({
        webhooks: items ?? [],
        nextCursor: nextCursor ?? null,
      })
    },
  )
}
