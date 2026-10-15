/** Sets --tint, the category colour behind icons and product photos. */
export function tint(color: string): React.CSSProperties {
  return { "--tint": color } as React.CSSProperties;
}
