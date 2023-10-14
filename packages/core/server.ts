import Bun from 'bun'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import initializePlugin from './utils/initializePlugin'
import { readPackageJson } from './utils/readPackageJson'
import { uniqBy } from './utils/uniqBy'
import context from './zembleContext'

import type Plugin from './Plugin'
import type { PluginWithMiddleware } from './PluginWithMiddleware'

const packageJson = readPackageJson()

const initializePlugins = async (plugins: readonly Plugin[], app: Hono) => {
  await plugins.reduce(async (
    prev,
    { pluginPath },
  ) => {
    await prev
    await initializePlugin({ pluginPath, app })
    return undefined
  }, Promise.resolve(undefined))

  await initializePlugin({ pluginPath: process.cwd(), app })
}

type Configure = {
  readonly plugins: readonly (Plugin | PluginWithMiddleware)[],
}

export type ZembleApp = {
  readonly app: Zemble.Server
  readonly start: () => Zemble.Server
}

const logFilter = (log: string) => (log.includes('BEGIN PRIVATE KEY') || log.includes('BEGIN PUBLIC KEY') ? '<<KEY>>' : log)

const filterConfig = (config: Record<string, unknown>) => Object.keys(config).reduce((prev, key) => {
  const value = config[key as keyof typeof config]
  return {
    ...prev,
    [key]: typeof value === 'string' ? logFilter(value) : value,
  }
}, {})

export const createApp = async ({ plugins: pluginsBeforeResolvingDeps }: Configure): Promise<ZembleApp> => {
  const app = new Hono() as Zemble.Server

  // maybe this should be later - how about middleware that overrides logger?
  if (process.env.NODE_ENV !== 'test') {
    app.use('*', logger(context.logger.log))
  }

  app.use('*', cors())

  const resolved = await Promise.all(
    pluginsBeforeResolvingDeps.flatMap(async (plugin) => [...await plugin.dependencies, plugin]),
  ).then((plugins) => plugins.flat())

  const plugins = uniqBy(resolved, 'pluginName')

  const middleware = plugins.filter(
    (plugin): plugin is PluginWithMiddleware => 'initializeMiddleware' in plugin,
  )

  context.logger.log(`Initializing ${packageJson.name} with ${plugins.length} plugins whereof ${middleware.length} contains middleware`)

  plugins.forEach((plugin) => {
    context.logger.log(`Loading ${plugin.pluginName} with config: ${JSON.stringify(filterConfig(plugin.config), null, 2)}`)
  })

  await middleware?.reduce(async (
    prev,
    middleware,
  ) => {
    await prev

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore sometimes context contains more stuff, initiated at other places
    await middleware.initializeMiddleware({ plugins, app, context })
    return undefined
  }, Promise.resolve(undefined))

  await initializePlugins(plugins, app)

  app.get('/', (c) => c.html(`<html>
    <head>
      <title>${packageJson.name}</title>
      <meta name="color-scheme" content="light dark">
    </head>
    <body>
      <div>
        <p>Hello Zemble! Serving ${packageJson.name}</p>
        <p><a href='/graphql'>Check out your GraphQL API here</a></p>
      </div>
    </body>
  </html>`))

  return {
    app,
    start: () => {
      const bunServer = Bun.serve({ fetch: app.fetch })
      console.log(`Serving on ${bunServer.hostname}:${bunServer.port}`)
      return app
    },
  }
}

export default createApp
