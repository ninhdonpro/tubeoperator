/**
 * Cloudflare Pages Function — POST /api/subscribe
 * Env vars (set in Cloudflare Pages dashboard):
 *   GHL_PRIVATE_TOKEN, GHL_LOCATION_ID, GHL_LANGUAGE_FIELD_ID
 */
export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, source, language } = body ?? {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const token = env.GHL_PRIVATE_TOKEN;
  const locationId = env.GHL_LOCATION_ID;
  const languageFieldId = env.GHL_LANGUAGE_FIELD_ID;

  if (!token || !locationId) {
    console.error('Missing GHL_PRIVATE_TOKEN or GHL_LOCATION_ID');
    return Response.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // CF-IPCountry is injected by Cloudflare automatically (absent in local dev)
  const country = request.headers.get('CF-IPCountry') ?? undefined;

  const ghlPayload = {
    email,
    locationId,
    tags: ['newsletter subscriber'],
    source: source ?? 'website',
    ...(country && { country }),
  };

  if (language && languageFieldId) {
    ghlPayload.customFields = [
      { id: languageFieldId, key: 'language', fieldValue: language },
    ];
  }

  try {
    const ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Version: 'v3',
      },
      body: JSON.stringify(ghlPayload),
    });

    if (!ghlRes.ok) {
      const text = await ghlRes.text();
      // Treat duplicate contact (already subscribed) as success
      if (ghlRes.status === 400 && text.includes('duplicated')) {
        return Response.json({ success: true, country });
      }
      console.error('GHL API error', ghlRes.status, text);
      return Response.json({ error: 'Subscription failed' }, { status: 502 });
    }

    // Return the detected country so the client can forward it to the survey
    // (the survey iframe prefills a hidden Country field from the URL).
    return Response.json({ success: true, country });
  } catch (err) {
    console.error('Subscribe error:', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
