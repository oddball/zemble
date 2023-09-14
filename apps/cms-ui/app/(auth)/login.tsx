import { useContext, useState } from 'react'
import {
  Button, Text, TextInput, View,
} from 'react-native'
import { useMutation, useQuery } from 'urql'

import { graphql } from '../../gql'
import { AuthContext } from '@kingstinct/react'

export const LoginConfirmMutation = graphql(`
  mutation LoginConfirm($email: String!, $code: String!) {
    loginConfirm(email: $email, code: $code) {
      __typename
      ... on LoginConfirmSuccessfulResponse {
        accessToken
      }
      ... on Error {
        message
      }
    }
  }
`)

export const LoginRequestMutation = graphql(`
  mutation LoginRequest($email: String!) {
    loginRequest(email: $email) {
      __typename
      ... on Error {
        message
      }
    }
  }
`)

const Login = () => {
  const {setToken} = useContext(AuthContext)

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [, loginRequest] = useMutation(LoginRequestMutation)
  const [, loginConfirm] = useMutation(LoginConfirmMutation)
  const doRequest = () => {
    loginRequest({ email })
  }
  const doConfirm = async () => {
    const { data} = await loginConfirm({ email, code })

    if(data.loginConfirm.__typename === 'LoginConfirmSuccessfulResponse'){
      setToken(data.loginConfirm.accessToken)
    }
    
    
  }
  return (
    <View>
      <Text>Email</Text>
      <TextInput
        accessibilityLabel='Email input field'
        accessibilityHint='email'
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={doRequest}
      />
      <Text>Otp</Text>
      <TextInput
        accessibilityLabel='Text input field'
        value={code}
        accessibilityHint='code'
        onChangeText={setCode}
        onSubmitEditing={doConfirm}
      />
      <Button title='Request Code' onPress={doRequest} />
      <Button title='Login' onPress={doConfirm} />
    </View>
  )
}

export default Login
