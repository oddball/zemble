import { Queue } from 'bullmq'

import type { MutationResolvers } from '../schema.generated'

const addJob: MutationResolvers['addJob'] = async (_, { queue, data, jobId }) => {
  const q = new Queue(queue, {

  })

  const job = await q.add(queue, data, {
    jobId: jobId ?? undefined,
  })

  return job
}

export default addJob
