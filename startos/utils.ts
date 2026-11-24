export const uiPort = 8080

export const dataDir = '/data'

export const sourceIds = [
  'none',
  'ipfire',
  'dbip',
  'maxmind',
  'ipinfo',
  'ip2location',
] as const

export type SourceId = (typeof sourceIds)[number]

type Download = {
  /** Files that echoip-geoupdate writes into the data directory. */
  files: string[]
  /** echoip's flags for reading those files. */
  flags: string[]
  /** How often echoip-geoupdate checks for a new release. */
  interval: string
}

const at = (file: string) => `${dataDir}/${file}`

export const downloads: Record<Exclude<SourceId, 'none'>, Download> = {
  ipfire: {
    files: ['location.db'],
    flags: ['-ipfire', at('location.db')],
    interval: '24h',
  },
  dbip: {
    files: ['city.mmdb', 'asn.mmdb'],
    flags: ['-f', at('city.mmdb'), '-c', at('city.mmdb'), '-a', at('asn.mmdb')],
    interval: '24h',
  },
  maxmind: {
    files: ['country.mmdb', 'city.mmdb', 'asn.mmdb'],
    flags: [
      '-f',
      at('country.mmdb'),
      '-c',
      at('city.mmdb'),
      '-a',
      at('asn.mmdb'),
    ],
    interval: '24h',
  },
  ipinfo: {
    files: ['ipinfo.mmdb'],
    flags: ['-ipinfo', at('ipinfo.mmdb')],
    interval: '24h',
  },
  ip2location: {
    files: ['ip2location.bin'],
    flags: ['-ip2location', at('ip2location.bin')],
    interval: '168h',
  },
}
