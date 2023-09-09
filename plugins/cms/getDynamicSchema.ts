/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLID, GraphQLInputObjectType, GraphQLFloat, GraphQLBoolean, GraphQLInterfaceType, GraphQLUnionType,
} from 'graphql'
import { ObjectId } from 'mongodb'

import { Entity, EntityEntry } from './clients/papr'
import {
  capitalize, pluralize,
} from './utils'

import type {
  BooleanField, LinkField, NumberField, RepeaterField, StringField,
} from './graphql/schema.generated'
import type { GraphQLFieldConfig, GraphQLType } from 'graphql'

type ReducerType = {
  readonly query: Record<string, GraphQLFieldConfig<any, any, any>>,
  readonly types: readonly GraphQLObjectType<any, any>[],
  readonly mutations: Record<string, GraphQLFieldConfig<any, any, any>>,
}

type IField = NumberField | StringField | BooleanField // | RepeaterField | LinkField

const fieldToType = (field: IField): GraphQLType => {
  // eslint-disable-next-line no-nested-ternary, unicorn/no-nested-ternary
  // const baseType = field.__typename === 'NumberField' ? GraphQLFloat : (field.__typename === 'BooleanField' ?
  // GraphQLBoolean : field.__typename === 'RepeaterField' ? new GraphQLList(field.availableFields.map(fieldToType)) :
  // GraphQLString)
  switch (field.__typename) {
    case 'NumberField':
      return GraphQLFloat
    case 'BooleanField':
      return GraphQLBoolean
      // case 'RepeaterField':
      //   // eslint-disable-next-line no-case-declarations
      //   const availableFields = field.availableFields.map((a) => new GraphQLObjectType({
      //     name: `${capitalize(field.name)}${capitalize(a.name)}`,
      //     fields: {

    //       [a.name]: {
    //         type: fieldToType(a),
    //       },
    //     }
    //   }))
    //   return new GraphQLList(new GraphQLUnionType({
    //     name: `${capitalize(field.name)}Union`,
    //     types: availableFields,
    //   }))
    default:
      return GraphQLString
  }
}

export default async () => {
  const entities = await Entity.find({})

  const config = await entities.reduce(async (prevP, entity) => {
    const prev = await prevP
    const obj = new GraphQLObjectType({
      fields: entity.fields.reduce((prev, field) => {
        // eslint-disable-next-line no-nested-ternary
        const baseType = field.__typename === 'NumberField'
          ? GraphQLFloat : (field.__typename === 'BooleanField'
            ? GraphQLBoolean /* field.__typename === 'RepeaterField'
            ? GraphQLList(field.availableFields.map(fieldToType)) : */ : GraphQLString)
        return ({
          ...prev,
          [field.name]: {
            type: field.isRequired ? new GraphQLNonNull(baseType) : baseType,
          },
        })
      }, {}),
      name: capitalize(entity.name),
    })

    const inputObj = new GraphQLInputObjectType({
      fields: entity.fields.reduce((prev, field) => {
        // eslint-disable-next-line no-nested-ternary
        const baseType = field.__typename === 'NumberField'
          ? GraphQLFloat : (field.__typename === 'BooleanField'
            ? GraphQLBoolean : GraphQLString)
        return ({
          ...prev,
          [field.name]: {
            type: field.isRequired && field.__typename !== 'IDField' ? new GraphQLNonNull(baseType) : baseType,
          },
        })
      }, {}),
      name: `${capitalize(entity.name)}Input`,
    })

    const getById: GraphQLFieldConfig<unknown, unknown, {readonly id: string}> = { // "book"
      type: new GraphQLNonNull(obj),
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (_, { id }) => EntityEntry.findOne({ entityType: entity.name, _id: new ObjectId(id) }),
    } as const

    const retVal: ReducerType = {
      query: {
        ...prev.query,
        [pluralize(entity.name)]: { // "books"
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(obj))),
          resolve: async () => EntityEntry.find({}),
        },
        [entity.name]: getById,
      },
      types: [...prev.types],
      mutations: {
        ...prev.mutations,
        [`create${capitalize(entity.name)}`]: {
          type: obj,
          args: {
            input: {
              type: new GraphQLNonNull(inputObj),
            },
          },
          resolve: async (_, { input }) => {
            const actualInput = {
              entityType: entity.name,
              ...input,
            }
            console.log('actualInput', actualInput)
            const res = await EntityEntry.findOneAndUpdate({
              entityType: entity.name,
            }, {
              $set: actualInput,
            }, {
              upsert: true,
              returnDocument: 'after',
            })
            return res!
          },
        },
      },
    }
    return retVal
  }, Promise.resolve<ReducerType>({
    query: {},
    types: [],
    mutations: {},
  }))

  const schema = new GraphQLSchema({
    types: config.types,
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        ...config.query,
      },
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: {
        ...config.mutations,
      },
    }),
  })

  return schema
}
