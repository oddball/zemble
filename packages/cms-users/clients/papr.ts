import zembleContext from '@zemble/core/zembleContext'
import Papr, { schema, types } from 'papr'

import plugin from '../plugin'

import type { MongoClient } from 'mongodb'

// eslint-disable-next-line import/no-mutable-exports
export let client: MongoClient | undefined

const papr = new Papr()

export async function connect() {
  const client = plugin.providers.mongodb

  const db = client?.db()

  if (db === undefined) throw new Error('MongoDB client not provided or initialized')

  papr.initialize(db)

  zembleContext.logger.log(`Registering ${papr.models.size} models...`)
  papr.models.forEach((model) => {
    zembleContext.logger.log(`Registering model: ${model.collection.collectionName}`)
  })

  await papr.updateSchemas()

  await db.collection('users').createIndex({ email: -1 }, { unique: true })
}

export async function disconnect() {
  await client?.close()
}

export enum PermissionType {
  MODIFY_ENTITY = 'modify-entity',
  USER_ADMIN = 'user-admin',
}

const PermissionSchemaObject = {
  type: types.enum(Object.values(PermissionType), { required: true }),
  scope: types.string({ required: true }),
}

export type Permission = typeof PermissionSchemaObject

const UserSchemaObject = {
  _id: types.objectId({ required: true }),
  email: types.string({ required: true }),
  lastLoginAt: types.date({ required: true }),
  permissions: types.array(types.object(PermissionSchemaObject), { required: true }),
}

export const UserSchema = schema(UserSchemaObject, {
  timestamps: true,
})

export type UserType = typeof UserSchemaObject

export const User = papr.model('users', UserSchema)

export default papr
