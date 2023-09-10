import plugin from '../../plugin'
import { graphql } from '../client.generated'

const HelloWorldQuery = graphql(`
  query Hello {
    hello
  }
`)

describe('Query.hello', () => {
  it('Should return world!', async () => {
    const { app } = await plugin.devApp()

    const response = await app.gqlRequest(HelloWorldQuery, {})
    expect(response).toEqual({
      data: {
        hello: 'world!',
      },
    })
  })
})
