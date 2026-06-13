/**
 * Split rendered HTML on the <!--gate--> marker.
 * Returns { free, locked }.
 * If no marker found, splits after the first <h2> section (~25% of content).
 */
export function splitGate(html: string): { free: string; locked: string } {
  const marker = '<!--gate-->';
  const idx = html.indexOf(marker);

  if (idx !== -1) {
    return {
      free: html.substring(0, idx),
      locked: html.substring(idx + marker.length),
    };
  }

  // Fallback: split after the first <h2> section
  // Find the second <h2 to cut there
  const firstH2 = html.indexOf('<h2');
  if (firstH2 === -1) return { free: html, locked: '' };

  const secondH2 = html.indexOf('<h2', firstH2 + 1);
  if (secondH2 === -1) return { free: html, locked: '' };

  return {
    free: html.substring(0, secondH2),
    locked: html.substring(secondH2),
  };
}
