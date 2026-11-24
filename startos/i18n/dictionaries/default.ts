export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Web Interface': 0,
  'The web interface is ready': 1,
  'The web interface is not ready': 2,
  // interfaces.ts
  'Web UI': 3,
  'Shows each visitor the public IP address that their request came from. The /ip path returns the address alone, as plain text.': 4,
  // main.ts
  'Location Data': 5,
  'The location data is loaded': 6,
  'Downloading the location data. The service log shows any download error.': 7,
  // actions/locationData.ts
  'Choose a database for showing the approximate location and network owner of each IP address.': 8,
  Source: 9,
  'The database that echoip looks up locations and network owners in. echoip downloads the database and keeps checking for new releases. Every source still shows the IP address.': 10,
  None: 11,
  'IPFire Location (country and network owner, no account)': 12,
  'DB-IP Lite (city and network owner, no account)': 13,
  'MaxMind GeoLite2 (city and network owner)': 14,
  'Account ID': 15,
  'The account ID of a free MaxMind account.': 16,
  'License key': 17,
  'A license key that the MaxMind account created.': 18,
  'IPinfo Lite (country and network owner)': 19,
  Token: 20,
  'The access token of a free IPinfo account.': 21,
  'IP2Location LITE (city)': 22,
  'The download token of a free IP2Location LITE account.': 23,
  'Hide the map': 24,
  "Show a visitor's coordinates as text instead of an OpenStreetMap map. The map sends the visitor's approximate location to openstreetmap.org.": 25,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
