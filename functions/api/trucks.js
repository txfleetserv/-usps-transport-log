// Cloudflare Pages Function: /api/trucks
// GET  -> returns { trucks: [...] }
// POST -> body { trucks: [...] }, replaces the whole stored roster

export async function onRequestGet(context) {
  try {
    const row = await context.env.DB
      .prepare('SELECT value FROM app_data WHERE key = ?')
      .bind('trucks')
      .first();

    const trucks = row && row.value ? JSON.parse(row.value) : [];
    return Response.json({ trucks });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const trucks = Array.isArray(body.trucks) ? body.trucks : [];

    await context.env.DB
      .prepare('INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime("now")) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
      .bind('trucks', JSON.stringify(trucks))
      .run();

    return Response.json({ ok: true, count: trucks.length });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
