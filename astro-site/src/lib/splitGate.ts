/**
 * Split rendered HTML into: intro, free (after first h2 until gate), and locked (after gate).
 * Intro = content from start until first <h2>
 * Free = content from first <h2> until <!--gate--> marker (or fallback split point)
 * Locked = content after <!--gate--> marker
 */
export function splitGate(html: string): { intro: string; free: string; locked: string } {
  const marker = '<!--gate-->';
  const markerIdx = html.indexOf(marker);

  // Find first <h2 position (case-insensitive)
  const lower = html.toLowerCase();
  const h2Idx = lower.indexOf('<h2');

  // Determine gate split point
  let gatePos = markerIdx;
  if (gatePos === -1) {
    // No marker: find all <h2 positions
    const h2Positions: number[] = [];
    let searchFrom = 0;
    while (true) {
      const pos = lower.indexOf('<h2', searchFrom);
      if (pos === -1) break;
      h2Positions.push(pos);
      searchFrom = pos + 1;
    }

    // If 2+ headings, cut at the second one
    if (h2Positions.length >= 2) {
      gatePos = h2Positions[1];
    } else if (h2Positions.length === 1) {
      // Only 1 heading, cut at ~25% of content
      const cutTarget = Math.floor(html.length * 0.25);
      const pClose = '</p>';
      let cutIdx = html.indexOf(pClose, cutTarget);
      gatePos = cutIdx !== -1 ? cutIdx + pClose.length : html.length;
    } else {
      // No headings, no split
      gatePos = html.length;
    }
  }

  // Build intro (start to first h2)
  const intro = h2Idx !== -1 ? html.substring(0, h2Idx) : '';

  // Build free (first h2 to gate marker)
  const freeStart = h2Idx !== -1 ? h2Idx : 0;
  const free = html.substring(freeStart, gatePos);

  // Build locked (after gate marker or from gate pos)
  const locked = markerIdx !== -1
    ? html.substring(markerIdx + marker.length)
    : html.substring(gatePos);

  return { intro, free, locked };
}
