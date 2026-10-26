import type { IncomingMessage } from 'node:http'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

type ApiModule = { POST: (request: Request) => Promise<Response> }

// Runs api/responses.ts inside the dev server the same way Vercel runs it in production.
function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''))

      server.middlewares.use('/api/responses', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        try {
          const { POST } = (await server.ssrLoadModule('/api/responses.ts')) as ApiModule
          const response = await POST(await toRequest(req))
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

async function toRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return new Request(new URL(req.url ?? '/', 'http://localhost'), {
    method: req.method,
    headers: { 'content-type': req.headers['content-type'] ?? '' },
    body: Buffer.concat(chunks),
  })
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
})
