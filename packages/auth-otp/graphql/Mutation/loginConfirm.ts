import Auth from '@zemble/auth'
import { generateRefreshToken } from '@zemble/auth/utils/generateRefreshToken'
import { setTokenCookies } from '@zemble/auth/utils/setBearerTokenCookie'
import { signJwt } from '@zemble/auth/utils/signJwt'

import { loginRequestKeyValue } from '../../clients/loginRequestKeyValue'
import plugin from '../../plugin'
import { isValidEmail } from '../../utils/isValidEmail'

import type {
  MutationResolvers,
} from '../schema.generated'

export const loginConfirm: NonNullable<MutationResolvers['loginConfirm']> = async (_, {
  email: emailIn, code,
}, { honoContext }) => {
  const email = emailIn.toLowerCase().trim()
  if (!isValidEmail(email)) {
    return { __typename: 'EmailNotValidError', message: 'Email not valid' }
  }

  if (code.length !== 6) {
    return { __typename: 'CodeNotValidError', message: 'Code should be 6 characters' }
  }

  const entry = await loginRequestKeyValue().get(email.toLowerCase())

  if (!entry) {
    return { __typename: 'CodeNotValidError', message: 'Must loginRequest code first, it might have expired' }
  }

  if (entry?.twoFactorCode !== code) {
    return { __typename: 'CodeNotValidError', message: 'Code not valid' }
  }

  const { sub, ...data } = await plugin.config.generateTokenContents({ email })

  const bearerToken = await signJwt({
    data,
    expiresInSeconds: Auth.config.bearerTokenExpiryInSeconds,
    sub,
  })

  const refreshToken = await generateRefreshToken({ sub })

  if (Auth.config.cookies.isEnabled) {
    setTokenCookies(honoContext, bearerToken, refreshToken)
  }

  return {
    __typename: 'LoginConfirmSuccessfulResponse',
    bearerToken,
    refreshToken,
  }
}

export default loginConfirm
