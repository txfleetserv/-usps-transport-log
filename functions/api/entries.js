// Cloudflare Pages Function: /api/entries
// GET  -> returns { entries: [...] }
// POST -> body { entries: [...] }, replaces the whole stored trip log

export async function onRequestGet(context) {
  try {
    const row = await context.env.DB
      .prepare('SELECT value FROM app_data WHERE key = ?')
      .bind('entries')
      .first();

    const entries = row && row.value ? JSON.parse(row.value) : [];
    return Response.json({ entries });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const entries = Array.isArray(body.entries) ? body.entries : [];

    await context.env.DB
      .prepare('INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime("now")) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
      .bind('entries', JSON.stringify(entries))
      .run();

    return Response.json({ ok: true, count: entries.length });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
