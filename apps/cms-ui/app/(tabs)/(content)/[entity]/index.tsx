import { router, useLocalSearchParams } from 'expo-router'
import {
  View,
} from 'react-native'
import { Button } from 'react-native-paper'
import { useQuery } from 'urql'

import ListOfEntries from '../../../../components/ListOfEntries'
import { graphql } from '../../../../gql'

export const GetEntityByPluralizedNameQuery = graphql(`
  query GetEntityByPluralizedName($namePlural: String!) { 
    getEntityByNamePlural(namePlural: $namePlural) { 
      nameSingular
      namePlural
      fields { 
        __typename 
        name
        isRequired
        isRequiredInput

        ... on EntityRelationField {
          entityNamePlural
        }

        ... on StringField {
          defaultValueString: defaultValue
          isSearchable
        }
        
        ... on NumberField {
          defaultValueNumber: defaultValue
        }
        
        ... on  BooleanField{
          defaultValueBoolean: defaultValue
        }
        ... on ArrayField {
          availableFields {
            name
            __typename
          }
        }
      } 
    } 
  }
`)

const EntityDetails = () => {
  const { entity } = useLocalSearchParams()

  const [{ data }, refetch] = useQuery({
    query: GetEntityByPluralizedNameQuery,
    variables: { namePlural: entity },
    pause: !entity,
  })

  return (
    <View style={{ flex: 1 }}>
      <Button mode='contained' style={{ margin: 16 }} onPress={() => router.push(`/(tabs)/(content)/${entity as string}/create`)}>{ `Create ${data?.getEntityByNamePlural?.nameSingular}` }</Button>
      { data?.getEntityByNamePlural ? (
        <ListOfEntries
          entity={data.getEntityByNamePlural}
          onSelected={(s) => {
            router.push(`/(tabs)/(content)/${entity as string}/edit/${s.id}`)
          }}
        />
      ) : null }
    </View>
  )
}

export default EntityDetails
