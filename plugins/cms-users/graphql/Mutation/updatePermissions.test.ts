import { ObjectId } from 'mongodb'
import { signJwt } from 'readapt-plugin-auth/utils/signJwt'

import { PermissionType, User } from '../../clients/papr'
import plugin from '../../plugin'
import { graphql } from '../client.generated'

// eslint-disable-next-line jest/no-export
export const UpdatePermissionsMutation = graphql(`
  mutation UpdatePermissions($userId: ID!, $permissions: [PermissionInput!]!) {
    updatePermissions(userId: $userId, permissions: $permissions) {
      id
      permissions{
        type
        scope
      }
    }
  }
`)

describe('Mutation.updatePermissions', () => {
  it('Should fail without permission', async () => {
    const app = await plugin.testApp()

    const { errors } = await app.gqlRequest(UpdatePermissionsMutation, { userId: 'abc', permissions: [{ type: PermissionType.MODIFY_ENTITY, scope: '*' }] })

    expect(errors?.[0].message).toEqual(`Accessing 'Mutation.updatePermissions' requires authentication.`)
  })

  it('Should succeed', async () => {
    const app = await plugin.testApp()

    const userId = new ObjectId()

    await User.insertOne({
      email: 'example@example.com',
      lastLoginAt: new Date(),
      permissions: [],
      _id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const token = signJwt({ data: { permissions: [{ type: PermissionType.USER_ADMIN, scope: '*' }] } })

    const { data } = await app.gqlRequest(UpdatePermissionsMutation, {
      userId: userId.toHexString(),
      permissions: [{ type: PermissionType.MODIFY_ENTITY, scope: '*' }],
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(data?.updatePermissions.permissions).toEqual([
      {
        type: PermissionType.MODIFY_ENTITY,
        scope: '*',
      },
    ])
  })

  it('Should fail if user doesnt exist', async () => {
    const app = await plugin.testApp()

    const userId = '650302fb3593982221caf2e4'

    const token = signJwt({ data: { permissions: [{ type: PermissionType.USER_ADMIN, scope: '*' }] } })

    const { errors } = await app.gqlRequest(UpdatePermissionsMutation, {
      userId,
      permissions: [{ type: PermissionType.MODIFY_ENTITY, scope: '*' }],
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(errors?.[0].message).toEqual('User not found')
  })

  it('Should fail if removing user-admin permission from self', async () => {
    const app = await plugin.testApp()

    const userId = '650302fb3593982221caf2e4'

    // todo [>1]: invalidation mechanism, three options:
    // 1. invalidate all tokens (forcing re-login)
    // 2. refetch permissions on every request for older tokens
    // 3. implement some kind of refresh mechanism (getting a new token with the right permissions, but without logging
    // in again)
    const token = signJwt({ data: { id: userId, permissions: [{ type: PermissionType.USER_ADMIN, scope: '*' }] } })

    const { errors } = await app.gqlRequest(UpdatePermissionsMutation, {
      userId,
      permissions: [{ type: PermissionType.MODIFY_ENTITY, scope: '*' }],
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(errors?.[0].message).toEqual('You cannot remove your own user-admin permission')
  })
})