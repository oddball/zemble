import defaultConfig from '@zemble/graphql/codegen'

import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  ...defaultConfig,
  generates: {
    ...defaultConfig.generates,
    [`./graphql/schema.generated.ts`]: {
      ...defaultConfig.generates[`./graphql/schema.generated.ts`],
      config: {
        ...defaultConfig.generates[`./graphql/schema.generated.ts`].config,
        mappers: {
          Entity: '../types#EntitySchemaType',
        },
      },
    },
  },
}

export default config
