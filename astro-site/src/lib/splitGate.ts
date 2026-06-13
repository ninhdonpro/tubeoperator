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

  // Fallback: find all <h2 occurrences (case-insensitive)
  const h2Positions: number[] = [];
  const lower = html.toLowerCase();
  let searchFrom = 0;
  while (true) {
    const pos = lower.indexOf('<h2', searchFrom);
    if (pos === -1) break;
    h2Positions.push(pos);
    searchFrom = pos + 1;
  }

  // If 2+ headings, cut at the second one (after first section)
  if (h2Positions.length >= 2) {
    return {
      free: html.substring(0, h2Positions[1]),
      locked: html.substring(h2Positions[1]),
    };
  }

  // If only 1 heading, cut at ~25% of content length (at a paragraph boundary)
  const cutTarget = Math.floor(html.length * 0.25);
  const pClose = '</p>';
  let cutPos = html.indexOf(pClose, cutTarget);
  if (cutPos !== -1) {
    cutPos += pClose.length;
    return {
      free: html.substring(0, cutPos),
      locked: html.substring(cutPos),
    };
  }

  // Last resort: no split at all
  return { free: html, locked: '' };
}
