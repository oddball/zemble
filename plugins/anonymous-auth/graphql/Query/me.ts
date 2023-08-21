import { verifyAuth } from "../../utils/verifyAuth"

export default (_:unknown, {token}:{token: string}) => {
  const {userId, username} = verifyAuth(token)
  return {userId, username}
}