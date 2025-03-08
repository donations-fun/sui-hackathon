export const formatAddress = (address: string, size: number = 4) => {
  return (address.slice(0, size) + '...' + address.slice(-size))
}
