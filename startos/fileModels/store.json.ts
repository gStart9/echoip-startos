import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { sourceIds } from '../utils'

const shape = z.looseObject({
  source: z.enum(sourceIds).catch('dbip'),
  maxmindAccountId: z.string().optional().catch(undefined),
  maxmindLicenseKey: z.string().optional().catch(undefined),
  ipinfoToken: z.string().optional().catch(undefined),
  ip2locationToken: z.string().optional().catch(undefined),
  noMap: z.boolean().catch(true),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: 'store.json' },
  shape,
)
