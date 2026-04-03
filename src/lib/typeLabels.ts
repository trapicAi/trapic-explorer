/** Map internal type keys to display labels */
export function getTypeLabel(type: string): string {
  switch (type) {
    case 'decision': return 'Decision';
    case 'fact': return 'Event';
    case 'convention': return 'Doctrine';
    case 'state': return 'Turning Point';
    default: return type;
  }
}
