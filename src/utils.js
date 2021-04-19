export function formatAddress(address) {
  let start = address.substr(0, 8)
  let length = address.length
  let end = address.substr(length-6, length-1)
  return `${start}...${end}`
}

export function formatAmount(amount, ustAmount = true) {
  if (ustAmount) {
    amount = amount / 1000000
  }
  return (parseInt(amount)).toFixed(2)
}
  