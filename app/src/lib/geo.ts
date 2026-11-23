// Small geodesy helpers for ring overlays. Accurate to well under 1% at city scale.
export type LngLat = [number, number];

const MI_PER_DEG_LAT = 69.0;

function offset([lng, lat]: LngLat, miles: number, bearingRad: number): LngLat {
  const dLat = (miles * Math.cos(bearingRad)) / MI_PER_DEG_LAT;
  const dLng = (miles * Math.sin(bearingRad)) / (MI_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
  return [lng + dLng, lat + dLat];
}

/** Closed polygon ring (first point repeated) approximating a circle of `miles` radius. */
export function circlePolygon(center: LngLat, miles: number, steps = 96): LngLat[] {
  const pts: LngLat[] = [];
  for (let i = 0; i < steps; i++) pts.push(offset(center, miles, (2 * Math.PI * i) / steps));
  return [...pts, pts[0]];
}

export function ringBounds(center: LngLat, miles: number): [LngLat, LngLat] {
  const [, s] = offset(center, miles, Math.PI);
  const [, n] = offset(center, miles, 0);
  const [w] = offset(center, miles, -Math.PI / 2);
  const [e] = offset(center, miles, Math.PI / 2);
  return [[w, s], [e, n]];
}
