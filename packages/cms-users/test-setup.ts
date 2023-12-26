/* eslint-disable import/no-extraneous-dependencies */
import { createTestApp } from '@zemble/core/test-utils'
import { startInMemoryInstanceAndConfigurePlugin, closeAndStopInMemoryInstance, emptyAllCollections } from '@zemble/mongodb/test-utils'
import { setupEnvOverride, resetEnv } from 'zemble-plugin-auth/test-utils'
import cmsPapr from 'zemble-plugin-cms/clients/papr'

import { connect, disconnect } from './clients/papr'
import plugin from './plugin'

export const setupBeforeAll = async () => {
  await setupEnvOverride()

  await startInMemoryInstanceAndConfigurePlugin()

  await createTestApp(plugin)

  await connect()
  await cmsPapr.connect()
}

export const teardownAfterAll = async () => {
  resetEnv()
  await Promise.all([disconnect(), cmsPapr.disconnect()])

  await closeAndStopInMemoryInstance()
}

export const tearDownAfterEach = async () => {
  await emptyAllCollections()
}
