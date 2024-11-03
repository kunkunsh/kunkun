/**
 * 2500 -> 2.5k
 * 2500000 -> 2.5m
 * 250,000,000 -> 250m
 * 2,500,000,000 -> 2.5b
 * @param num
 * @returns
 */
export function humanReadableNumber(num: number): string {
	if (num < 1000) {
		return num.toString()
	} else if (num < 1000000) {
		return (num / 1000).toFixed(1) + "k"
	} else if (num < 1000000000) {
		return (num / 1000000).toFixed(1) + "m"
	} else {
		return (num / 1000000000).toFixed(1) + "b"
	}
}
