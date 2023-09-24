import {
  GraphQLList,
  GraphQLNonNull,
} from 'graphql'

import {
  Content,
} from '../clients/papr'

import type {
  EntityType,
} from '../clients/papr'
import type {
  GraphQLFieldConfig,
  GraphQLOutputType,
} from 'graphql'

const createGetAll = (entity: EntityType, type: GraphQLOutputType) => {
  const getAll: GraphQLFieldConfig<unknown, unknown, unknown> = { // "books"
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(type))),
    resolve: async () => Content.find({ entityType: entity.name }),
  }

  return getAll
}

export default createGetAll