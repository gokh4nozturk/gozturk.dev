// Builds a displacement map for an SVG <feDisplacementMap> that makes a
// rounded rectangle act like a convex glass lens: pixels inside the bezel
// (near the edge) sample from further inside the shape, so content bends and
// swells along the rim while the center stays clear.
//
// Encoding: R = x offset, G = y offset, 128 = no offset. With the filter's
// `scale` S, a channel value v moves the sample by S * (v / 255 - 0.5) px.

const NEUTRAL = 128;

// Signed distance from (px, py) to a rounded box centered at the origin.
// Negative inside. Also returns the outward normal of the nearest edge.
function roundedBox(px, py, halfW, halfH, radius) {
  const qx = Math.abs(px) - (halfW - radius);
  const qy = Math.abs(py) - (halfH - radius);
  const sx = Math.sign(px) || 1;
  const sy = Math.sign(py) || 1;

  if (qx > 0 && qy > 0) {
    const len = Math.hypot(qx, qy);
    return { distance: len - radius, nx: (qx / len) * sx, ny: (qy / len) * sy };
  }
  if (qx > qy) return { distance: qx - radius, nx: sx, ny: 0 };
  return { distance: qy - radius, nx: 0, ny: sy };
}

/**
 * @param {number} width  CSS px
 * @param {number} height CSS px
 * @param {object} [options]
 * @param {number} [options.radius] corner radius in CSS px (default: pill)
 * @param {number} [options.bezel]  width of the refracting rim in CSS px
 * @param {number} [options.resolution] map pixels per CSS px
 * @returns {string} PNG data URL
 */
export function createLensMap(width, height, options = {}) {
  const radius = Math.min(options.radius ?? height / 2, width / 2, height / 2);
  const bezel = options.bezel ?? Math.min(12, height / 4);
  const resolution = options.resolution ?? 2;

  const w = Math.max(1, Math.round(width * resolution));
  const h = Math.max(1, Math.round(height * resolution));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(w, h);
  const { data } = image;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = (x + 0.5) / resolution - width / 2;
      const py = (y + 0.5) / resolution - height / 2;
      const { distance, nx, ny } = roundedBox(px, py, width / 2, height / 2, radius);
      const depth = -distance;

      let dx = 0;
      let dy = 0;
      if (depth > 0 && depth < bezel) {
        // Strongest at the very edge, easing to zero at the inner bezel line,
        // like the curved shoulder of a convex lens.
        const t = 1 - depth / bezel;
        const strength = t * t * (3 - 2 * t);
        // Sample inward (against the outward normal).
        dx = -nx * strength;
        dy = -ny * strength;
      }

      const i = (y * w + x) * 4;
      data[i] = NEUTRAL + dx * 127;
      data[i + 1] = NEUTRAL + dy * 127;
      data[i + 2] = NEUTRAL;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}
