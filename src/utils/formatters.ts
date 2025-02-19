export const formatSalary = (
  type: string,
  min: number,
  max: number
): string => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('ja-JP')
  }

  switch (type) {
    case 'monthly':
      return `月給 ${formatNumber(min)}円 ～ ${formatNumber(max)}円`
    case 'daily':
      return `日給 ${formatNumber(min)}円 ～ ${formatNumber(max)}円`
    case 'commission':
      return `歩合制 ${formatNumber(min)}円 ～ ${formatNumber(max)}円`
    default:
      return `${formatNumber(min)}円 ～ ${formatNumber(max)}円`
  }
} 