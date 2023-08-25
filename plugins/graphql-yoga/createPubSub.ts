import type { RedisOptions } from 'ioredis'
import { createPubSub as createYogaPubSub } from 'graphql-yoga'

import { createRedisEventTarget } from '@graphql-yoga/redis-event-target'
import { createClient } from './clients/redis'
 
const createPubSub = (redisUrl?:string, redisConfig?: RedisOptions) => {
  if(redisUrl){
    const publishClient = createClient(redisUrl, redisConfig)
    const subscribeClient = createClient(redisUrl, redisConfig)
    
    const eventTarget = createRedisEventTarget({
      publishClient,
      subscribeClient
    })

    return createYogaPubSub({ eventTarget })
  }

  return createYogaPubSub()
}


export default createPubSub