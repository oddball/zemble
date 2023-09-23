import {
  GraphQLBoolean, GraphQLID, GraphQLNonNull,
} from 'graphql'
import { ObjectId } from 'mongodb'

import { Content } from '../clients/papr'

import type { EntityType } from '../clients/papr'
import type { GraphQLFieldConfig } from 'graphql'

const createDeleteEntryResolver = (entity: EntityType) => {
  const deleteEntityEntry: GraphQLFieldConfig<unknown, unknown, { readonly id: string }> = {
    type: new GraphQLNonNull(GraphQLBoolean),
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_, { id }) => {
      await Content.findOneAndDelete({
        entityType: entity.name,
        _id: new ObjectId(id),
      })
      return true
    },
  }

  return deleteEntityEntry
}

export default createDeleteEntryResolver
