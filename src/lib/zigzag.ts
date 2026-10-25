/** clip-path polygon that cuts a paper edge into teeth, like a torn-off receipt or a printed menu. */
export function zigzag(edges: 'bottom' | 'both', teeth = 36, depth = 10): string {
  const pts: string[] = [];
  const x = (i: number) => `${((i / teeth) * 100).toFixed(3)}%`;
  if (edges === 'both') for (let i = 0; i <= teeth; i++) pts.push(`${x(i)} ${i % 2 ? 0 : depth}px`);
  else pts.push('0 0', '100% 0');
  for (let i = teeth; i >= 0; i--) pts.push(`${x(i)} calc(100% - ${i % 2 ? 0 : depth}px)`);
  return `polygon(${pts.join(', ')})`;
}
