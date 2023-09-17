import { Entities } from '../../clients/papr'

import type { QueryResolvers } from '../schema.generated'

const entity: QueryResolvers['entity'] = async (_, { name }) => {
  const result = await Entities.findOne({ name })

  if (!result) {
    return null
  }

  return { ...result, fields: Object.values(result.fields) }
}

export default entity
