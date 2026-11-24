import { stat } from 'node:fs/promises'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { dataDir, downloads, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const settings = await storeJson
    .read((s) => ({
      source: s.source,
      maxmindAccountId: s.maxmindAccountId,
      maxmindLicenseKey: s.maxmindLicenseKey,
      ipinfoToken: s.ipinfoToken,
      ip2locationToken: s.ip2locationToken,
      noMap: s.noMap,
    }))
    .const(effects)
  const source = settings?.source ?? 'dbip'
  const download = source === 'none' ? null : downloads[source]

  const image = (name: string, readonly: boolean) =>
    sdk.SubContainer.of(
      effects,
      { imageId: 'echoip' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: dataDir,
        readonly,
      }),
      name,
    )

  const daemons = sdk.Daemons.of(effects).addDaemon('echoip', {
    subcontainer: image('echoip', true),
    exec: {
      // The StartOS proxy replaces any client-sent X-Forwarded-For header.
      command: [
        '/opt/echoip/echoip',
        '-l',
        `:${uiPort}`,
        '-t',
        '/opt/echoip/html',
        '-H',
        'X-Forwarded-For',
        '-L',
        ...(settings?.noMap === false ? [] : ['-n']),
        ...(download ? [...download.flags, '-R', '1m'] : []),
      ],
    },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })

  if (!download) return daemons

  return daemons.addDaemon('geoupdate', {
    subcontainer: image('geoupdate', false),
    exec: {
      command: [
        '/opt/echoip/echoip-geoupdate',
        '-source',
        source,
        '-dir',
        dataDir,
        '-interval',
        download.interval,
      ],
      env: {
        MAXMIND_ACCOUNT_ID: settings?.maxmindAccountId,
        GEOIP_LICENSE_KEY: settings?.maxmindLicenseKey,
        IPINFO_TOKEN: settings?.ipinfoToken,
        IP2LOCATION_TOKEN: settings?.ip2locationToken,
      },
    },
    ready: {
      display: i18n('Location Data'),
      fn: async () => {
        const present = await Promise.all(
          download.files.map((f) =>
            stat(sdk.volumes.main.subpath(f)).then(
              () => true,
              () => false,
            ),
          ),
        )
        return present.every(Boolean)
          ? { result: 'success', message: i18n('The location data is loaded') }
          : {
              result: 'loading',
              message: i18n(
                'Downloading the location data. The service log shows any download error.',
              ),
            }
      },
    },
    requires: [],
  })
})
