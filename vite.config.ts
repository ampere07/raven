import type { IncomingMessage } from 'node:http'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

type Handler = (request: Request) => Promise<Response>

// Runs the functions in api/ inside the dev server the same way Vercel runs them in production:
// /api/<name> loads api/<name>.ts and calls its export named after the HTTP method.
function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''))

      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.originalUrl ?? req.url ?? '/', 'http://localhost')
        const name = url.pathname.replace(/^\/api\//, '')
        if (!/^[a-z-]+$/.test(name)) return next()

        try {
          const module = (await server.ssrLoadModule(`/api/${name}.ts`)) as Record<string, Handler | undefined>
          const handler = module[req.method ?? 'GET']
          if (!handler) {
            res.statusCode = 405
            res.end()
            return
          }
          const response = await handler(await toRequest(req, url))
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

async function toRequest(req: IncomingMessage, url: URL): Promise<Request> {
  const method = req.method ?? 'GET'
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value)
  }

  if (method === 'GET' || method === 'HEAD') return new Request(url, { method, headers })

  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return new Request(url, { method, headers, body: Buffer.concat(chunks) })
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
})
