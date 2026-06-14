import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  resolve: {
    alias: {
      'react/jsx-runtime': path.resolve(__dirname, 'src/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'src/jsx-runtime.js')
    }
  }
})
