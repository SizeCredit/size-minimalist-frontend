export function format(address: string | undefined) {
  return address ? address.substring(0, 6) + '...' + address.substring(address.length - 4) : 'Connect wallet'
}