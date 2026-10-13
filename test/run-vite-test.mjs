// Runs a .jsx test module through Vite so it is transformed exactly the way
// the app builds it. Usage: node test/run-vite-test.mjs <module-path>
import { createServer } from 'vite'

const target = process.argv[2] ?? '/test/render.test.js'

const vite = await createServer({
  configFile: './vite.config.js',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error'
})

let failed = 1
try {
  const mod = await vite.ssrLoadModule(target)
  failed = await mod.run()
} catch (err) {
  console.error(err)
} finally {
  await vite.close()
}

process.exit(failed ? 1 : 0)