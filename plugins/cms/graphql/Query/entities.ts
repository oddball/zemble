import { Entity } from '../../clients/papr'

import type { QueryResolvers } from '../schema.generated'

const entities: QueryResolvers['entities'] = async () => {
  const result = await Entity.find({})

  return result.map((entity) => ({
    ...entity,
    fields: Object.values(entity.fields),
  }))
}

export default entities
