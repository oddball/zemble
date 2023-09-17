import { router } from 'expo-router'
import { View, Button } from 'react-native'
import { useQuery } from 'urql'

import { graphql } from '../../../gql'
import { capitalize, pluralize } from '../../../utils/text'

export const GetEntitiesQuery = graphql(`
  query GetEntities {
    entities {
      name
      fields {
        name
      }
    }
  }
`)

const EntityList = () => {
  const [{ data }] = useQuery({
    query: GetEntitiesQuery,
    variables: {},
  })

  return (
    <View>
      {
        data?.entities.map((entity) => (
          <View key={entity.name} style={{ margin: 10 }}>
            <Button
              title={capitalize(pluralize(entity.name))}
              onPress={() => router.push(`/${pluralize(entity.name)}`)}
            />
          </View>
        ))
      }
    </View>
  )
}

export default EntityList
