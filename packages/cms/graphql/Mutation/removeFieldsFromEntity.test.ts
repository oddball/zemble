import { signJwt } from 'zemble-plugin-auth/utils/signJwt'
import {
  beforeEach, test, expect, beforeAll, afterAll, afterEach,
} from 'bun:test'

import plugin from '../../plugin'
import { setupBeforeAll, tearDownAfterEach, teardownAfterAll } from '../../test-setup'
import { readEntities } from '../../utils/fs'
import { AddFieldsToEntityMutation, CreateEntityMutation } from '../../utils/testOperations'
import { graphql } from '../client.generated'

beforeAll(setupBeforeAll)
afterAll(teardownAfterAll)
afterEach(tearDownAfterEach)

const RemoveFieldsFromEntityMutation = graphql(`
  mutation RemoveFieldsFromEntity($namePlural: String!, $fields: [String!]!) {
    removeFieldsFromEntity(namePlural: $namePlural, fields: $fields) {
      nameSingular
      namePlural
      fields {
        __typename
        name
      }
    }
  }
`)

let app: Zemble.Server
let opts: Record<string, unknown>

beforeEach(async () => {
  app = await plugin.testApp()
  const token = await signJwt({ data: { permissions: [{ type: 'modify-entity' }] } })
  opts = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  await app.gqlRequest(CreateEntityMutation, {
    nameSingular: 'book',
    namePlural: 'books',
  }, opts)
})

test('should remove a title field', async () => {
  await app.gqlRequest(AddFieldsToEntityMutation, {
    namePlural: 'books',
    fields: [
      {
        StringField: {
          name: 'title',
          isRequired: true,
        },
      },
    ],
  }, opts)

  const { data } = await app.gqlRequest(RemoveFieldsFromEntityMutation, {
    namePlural: 'books',
    fields: ['title'],
  }, opts)

  expect(data?.removeFieldsFromEntity).toEqual({
    namePlural: 'books',
    nameSingular: 'book',
    fields: [
      {
        __typename: 'IDField',
        name: 'id',
      },
    ],
  })

  const entitites = await readEntities()

  expect(entitites).toEqual([
    {
      nameSingular: 'book',
      namePlural: 'books',
      isPublishable: false,
      fields: [
        {
          __typename: 'IDField',
          isRequired: true,
          isRequiredInput: false,
          name: 'id',
        },
      ],
    },
  ])
})
