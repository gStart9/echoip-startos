import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'echoip',
  title: 'echoip',
  license: 'BSD-3-Clause',
  packageRepo: 'https://github.com/gStart9/echoip-startos',
  upstreamRepo: 'https://github.com/gStart9/echoip',
  marketingUrl: 'https://github.com/mpolden/echoip',
  donationUrl: null,
  description: { short, long },
  // main holds the downloaded location databases, and startos the settings.
  volumes: ['main', 'startos'],
  images: {
    echoip: {
      source: {
        dockerBuild: {
          workdir: './upstream-project',
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
