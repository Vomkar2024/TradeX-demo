import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { spawn } from 'child_process'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function autoStartBackendPlugin() {
  let backendProcess = null

  return {
    name: 'auto-start-backend',
    configureServer(server) {
      // Probe if backend is already listening on port 5000
      const req = http.get('http://localhost:5000', (res) => {
        console.log('\x1b[32m%s\x1b[0m', '⚡ [TradeX] Backend is already running on http://localhost:5000')
      })

      req.on('error', () => {
        console.log('\x1b[36m%s\x1b[0m', '🚀 [TradeX] Auto-launching Express backend server on port 5000...')
        const serverDir = path.resolve(__dirname, '../server')
        backendProcess = spawn('node', ['index.js'], {
          cwd: serverDir,
          stdio: 'inherit',
          shell: true,
        })

        backendProcess.on('error', (err) => {
          console.error('[TradeX] Failed to auto-start backend process:', err.message)
        })
      })

      const handleExit = () => {
        if (backendProcess) {
          try {
            backendProcess.kill()
          } catch (e) {
            // ignore
          }
        }
      }

      process.on('exit', handleExit)
      process.on('SIGINT', () => {
        handleExit()
        process.exit()
      })
      process.on('SIGTERM', () => {
        handleExit()
        process.exit()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), autoStartBackendPlugin()],
  server: {
    port: 3000,
  },
})
