import { Plugin } from '@zemble/core'
import createLogger from '@zemble/core/createLogger'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

import type { IStandardLogger } from '@zemble/core'
import type { JsonValue } from 'type-fest'

export type MigrationStatus<TProgress extends JsonValue = JsonValue> = {
  readonly name: string
  readonly startedAt: Date
  readonly completedAt?: Date
  readonly startedDownAt?: Date
  readonly progress?: TProgress
  readonly erroredAt?: Date
  readonly error?: string | null
}

export interface MigrationAdapter<TProgress extends JsonValue = JsonValue> {
  readonly status: () => Promise<readonly MigrationStatus<TProgress>[]> | readonly MigrationStatus<TProgress>[]
  readonly up: (name: string, runMigration: (context?: Zemble.MigrationContext) => Promise<void>) => Promise<void>
  readonly down: (name: string, runMigration: (context?: Zemble.MigrationContext) => Promise<void>) => Promise<void>
  readonly progress: (migrationStats: Pick<Required<MigrationStatus<TProgress>>, 'progress' | 'name'>) => Promise<void>
}

export type Up<TProgress extends JsonValue = JsonValue> = (config: {
  readonly progress: TProgress | undefined,
  readonly progressCallback: ((progress: TProgress) => void) | undefined,
  readonly context: Zemble.MigrationContext,
}) => Promise<void>
export type Down = (context: Zemble.MigrationContext) => Promise<void>

export type Migration = {
  readonly up: Up
  readonly down?: Down
}

interface MigrationConfig extends Zemble.DefaultMiddlewareConfig {
  readonly createAdapter: (config: { readonly providers: Zemble.Providers}) => Promise<MigrationAdapter> | MigrationAdapter
  readonly migrationsDir?: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Zemble {
    interface MiddlewareConfig {
      readonly ['@zemble/migrations']?: MigrationConfig
    }

    interface MigrationContext {

    }
  }
}

type MigrationToProcess<T extends JsonValue = JsonValue> = {
  readonly migrationName: string,
  readonly fullPath: string,
  readonly isMigrated: boolean,
  readonly progress?: T,
  readonly adapter: MigrationAdapter<T>,
}

const getMigrations = async (migrationsDir: string, adapter: MigrationAdapter | undefined) => {
  const dirContents = await readdir(migrationsDir).catch(() => [])
  const filesRaw = dirContents.filter((filename) => !filename.includes('.test.') && !filename.includes('.spec.'))

  if (filesRaw.length === 0) {
    return []
  }

  if (!adapter) {
    throw new Error(`No migration adapter provided, expected one for migrations in ${migrationsDir}`)
  }

  const statuses = await adapter.status()

  const migrations = filesRaw.map<MigrationToProcess>((filename) => {
    const filenameWithoutExtension = filename.split('.').slice(0, -1).join('.')

    const currentStatus = statuses.find((status) => status.name === filenameWithoutExtension)

    return {
      migrationName: filenameWithoutExtension,
      fullPath: join(migrationsDir, filename),
      isMigrated: !!currentStatus?.completedAt,
      progress: currentStatus?.progress,
      adapter,
    }
  })

  return migrations
}

let upMigrationsRemaining = [] as readonly MigrationToProcess[]
let downMigrationsRemaining = [] as readonly MigrationToProcess[]

export const migrateDown = async (
  opts?: { readonly migrateDownCount?: number, readonly logger?: IStandardLogger },
) => {
  const { migrateDownCount = 1, logger = defaultLogger() } = opts ?? {}
  logger.info(`migrateDown: ${upMigrationsRemaining.length} migrations to process`)

  await downMigrationsRemaining.reduce(async (prev, {
    migrationName, fullPath, adapter,
  }, index) => {
    await prev
    if (index >= migrateDownCount) {
      return
    }

    logger.info(`Migrate down: ${migrationName}`)
    const { down } = await import(fullPath) as Migration
    if (down) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await adapter?.down(migrationName, async (context) => down(context ?? {}))
    } else {
      logger.warn(`Migration ${migrationName} did not have a down function.`)
    }
  }, Promise.resolve())
}

let defaultLoggerInternal: IStandardLogger | undefined
const defaultLogger = () => {
  defaultLoggerInternal ??= createLogger({ pluginName: '@zemble/migrations' })
  return defaultLoggerInternal
}

export const migrateUp = async (opts?: { readonly logger?: IStandardLogger, readonly migrateUpCount?: number }) => {
  const { logger = defaultLogger(), migrateUpCount = Infinity } = opts ?? {}

  logger.info(`migrateUp: ${upMigrationsRemaining.length} migrations to process`)
  await upMigrationsRemaining.reduce(async (prev, {
    migrationName, fullPath, progress, adapter,
  }, index) => {
    await prev

    if (index >= migrateUpCount) {
      return
    }

    logger.info(`Migrate up: ${migrationName}`)
    const { up } = await import(fullPath) as unknown as { readonly up: Up, readonly down?: Down }
    if (up) {
      await adapter?.up(migrationName, async (context) => up({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        context: context ?? {},
        progress,
        progressCallback: adapter.progress ? async (pgs) => adapter.progress?.({ name: migrationName, progress: pgs }) : undefined,
      }))
    }
  }, Promise.resolve())
}

interface MigrationPluginConfig extends Zemble.GlobalConfig, MigrationConfig {
  readonly waitForMigrationsToComplete?: boolean
  readonly runMigrationsOnStart?: boolean
}

const defaultConfig = {
  runMigrationsOnStart: true,
  waitForMigrationsToComplete: true,
} satisfies Omit<MigrationPluginConfig, 'createAdapter'>

const plugin = new Plugin<MigrationPluginConfig, typeof defaultConfig>(
  import.meta.dir,
  {
    middleware: (async ({
      app, config, logger,
    }) => {
      const migrationsPathOfApp = join(app.appDir, config.migrationsDir ?? 'migrations')

      const appMigrations = await getMigrations(migrationsPathOfApp, await config?.createAdapter?.(app))

      const pluginMigrations = await Promise.all(app.plugins.map(async (plugin) => {
        const migrationConfig = plugin.config.middleware?.['@zemble/migrations'] as MigrationConfig | undefined

        const pluginMigrationsPath = join(plugin.pluginPath, migrationConfig?.migrationsDir ?? 'migrations')
        return getMigrations(pluginMigrationsPath, await migrationConfig?.createAdapter?.(plugin))
      }))

      const allMigrations = appMigrations.concat(...pluginMigrations.flat())

      upMigrationsRemaining = allMigrations.filter((migration) => !migration.isMigrated).sort((a, b) => a.migrationName.localeCompare(b.migrationName))
      downMigrationsRemaining = allMigrations.filter((migration) => migration.isMigrated).sort((a, b) => b.migrationName.localeCompare(a.migrationName))

      return async () => {
        if (config.runMigrationsOnStart) {
          const completer = migrateUp({ logger })

          if (config.waitForMigrationsToComplete) {
            await completer
          }
        }
      }
    }),
    dependencies: [],
    defaultConfig,
  },
)

export default plugin
