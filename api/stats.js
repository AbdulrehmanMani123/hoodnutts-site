// Vercel serverless function: GET /api/stats
// Reads the OpenSea key from the OPENSEA_API_KEY environment variable (set it in Vercel, never in index.html).
export default async function handler(req, res) {
  const key = process.env.OPENSEA_API_KEY;
  if (!key) return res.status(500).json({ error: 'OPENSEA_API_KEY not set' });
  try {
    const r = await fetch('https://api.opensea.io/api/v2/collections/hoodnutts/stats', {
      headers: { 'x-api-key': key, accept: 'application/json' }
    });
    if (!r.ok) return res.status(r.status).json({ error: 'OpenSea error ' + r.status });
    const d = await r.json(), t = d.total || {}, day = (d.intervals || []).find(i => i.interval === 'one_day') || {};
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    res.status(200).json({
      floor: t.floor_price ?? null, symbol: t.floor_price_symbol || 'ETH',
      volume: t.volume ?? null, sales: t.sales ?? null, owners: t.num_owners ?? null,
      vol24: day.volume ?? null, sales24: day.sales ?? null
    });
  } catch (e) { res.status(502).json({ error: 'fetch failed' }); }
}
