const intervals: [string, number][] = [
    ["weeks", 604800],
    ["days", 86400],
    ["hours", 3600],
    ["minutes", 60],
    ["seconds", 1],
];

export function formatSeconds(seconds: number, granularity = 2) {
    const result: string[] = [];
    let secondsLeft = seconds;

    for (const [name, count] of intervals) {
        const value = Math.floor(secondsLeft / count);
        if (value) {
            secondsLeft -= value * count;
            let formattedName = name;
            if (value === 1) {
                formattedName = name.slice(0, -1);
            }
            result.push(`${value} ${formattedName}`);
        }
    }
    return result.slice(0, granularity).join(", ");
} 

export function formatNumber(num: number): string {
  if (isNaN(num)) return '0'; 

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  return num.toString();
}