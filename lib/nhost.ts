import { NhostClient } from '@nhost/nhost-js'

const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'sbpnfqrsnvtyvkgldcco',
  region: process.env.NEXT_PUBLIC_NHOST_REGION || 'eu-central-1'
})

export { nhost }