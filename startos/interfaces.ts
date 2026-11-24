import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, 'main')
  const origin = await multi.bindPort(uiPort, { protocol: 'http' })
  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: 'ui',
    description: i18n(
      'Shows each visitor the public IP address that their request came from. The /ip path returns the address alone, as plain text.',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  return [await origin.export([ui])]
})
