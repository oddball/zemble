import mergeDeep from '@zemble/core/utils/mergeDeep'
import defaultConfig, { DEFAULT_SERVER_OUTPUT_SCHEMA_PATH, createServerOutputConfig } from '@zemble/graphql/codegen'

import type { CodegenConfig } from '@graphql-codegen/cli'

const config = {
  generates: {
    [DEFAULT_SERVER_OUTPUT_SCHEMA_PATH]: {
      ...createServerOutputConfig(),
      config: {
        mappers: {
          BullJob: 'bullmq#Job',
          BullQueue: 'bullmq#Queue',
        },
      },
    },
  },
} satisfies CodegenConfig

export default mergeDeep(defaultConfig, config)
