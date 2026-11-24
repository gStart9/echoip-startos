import { rm, readdir } from 'node:fs/promises'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value, Variants } = sdk

const token = (name: string, description: string) =>
  Value.text({
    name,
    description,
    required: true,
    default: null,
    masked: true,
  })

const inputSpec = InputSpec.of({
  source: Value.union({
    name: i18n('Source'),
    description: i18n(
      'The database that echoip looks up locations and network owners in. echoip downloads the database and keeps checking for new releases. Every source still shows the IP address.',
    ),
    default: 'none',
    variants: Variants.of({
      none: { name: i18n('None'), spec: InputSpec.of({}) },
      ipfire: {
        name: i18n('IPFire Location (country and network owner, no account)'),
        spec: InputSpec.of({}),
      },
      dbip: {
        name: i18n('DB-IP Lite (city and network owner, no account)'),
        spec: InputSpec.of({}),
      },
      maxmind: {
        name: i18n('MaxMind GeoLite2 (city and network owner)'),
        spec: InputSpec.of({
          accountId: Value.text({
            name: i18n('Account ID'),
            description: i18n('The account ID of a free MaxMind account.'),
            required: true,
            default: null,
          }),
          licenseKey: token(
            i18n('License key'),
            i18n('A license key that the MaxMind account created.'),
          ),
        }),
      },
      ipinfo: {
        name: i18n('IPinfo Lite (country and network owner)'),
        spec: InputSpec.of({
          token: token(
            i18n('Token'),
            i18n('The access token of a free IPinfo account.'),
          ),
        }),
      },
      ip2location: {
        name: i18n('IP2Location LITE (city)'),
        spec: InputSpec.of({
          token: token(
            i18n('Token'),
            i18n('The download token of a free IP2Location LITE account.'),
          ),
        }),
      },
    }),
  }),
  noMap: Value.toggle({
    name: i18n('Hide the map'),
    description: i18n(
      "Show a visitor's coordinates as text instead of an OpenStreetMap map. The map sends the visitor's approximate location to openstreetmap.org.",
    ),
    default: true,
  }),
})

export const locationData = sdk.Action.withInput(
  'location-data',
  {
    name: i18n('Location Data'),
    description: i18n(
      'Choose a database for showing the approximate location and network owner of each IP address.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,
  async () => {
    const store = await storeJson.read().once()
    if (!store) return null
    const noMap = store.noMap
    switch (store.source) {
      case 'maxmind':
        return {
          noMap,
          source: {
            selection: 'maxmind' as const,
            value: {
              accountId: store.maxmindAccountId ?? '',
              licenseKey: store.maxmindLicenseKey ?? '',
            },
          },
        }
      case 'ipinfo':
        return {
          noMap,
          source: {
            selection: 'ipinfo' as const,
            value: { token: store.ipinfoToken ?? '' },
          },
        }
      case 'ip2location':
        return {
          noMap,
          source: {
            selection: 'ip2location' as const,
            value: { token: store.ip2locationToken ?? '' },
          },
        }
      default:
        return { noMap, source: { selection: store.source, value: {} } }
    }
  },
  async ({ effects, input }) => {
    const { selection, value } = input.source
    const previous = await storeJson.read((s) => s.source).once()
    await storeJson.merge(effects, {
      source: selection,
      noMap: input.noMap,
      ...(selection === 'maxmind' && {
        maxmindAccountId: value.accountId,
        maxmindLicenseKey: value.licenseKey,
      }),
      ...(selection === 'ipinfo' && { ipinfoToken: value.token }),
      ...(selection === 'ip2location' && { ip2locationToken: value.token }),
    })
    // Another source's files share names with this source's.
    if (previous !== selection) {
      const dir = sdk.volumes.main.path
      for (const entry of await readdir(dir)) {
        await rm(`${dir}/${entry}`, { recursive: true, force: true })
      }
    }
  },
)
