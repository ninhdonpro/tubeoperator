import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string; source?: string; language?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { email, source, language } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email address' }, 400);
  }

  const token = import.meta.env.GHL_PRIVATE_TOKEN;
  const locationId = import.meta.env.GHL_LOCATION_ID;
  const languageFieldId = import.meta.env.GHL_LANGUAGE_FIELD_ID;

  if (!token || !locationId) {
    console.error('Missing GHL_PRIVATE_TOKEN or GHL_LOCATION_ID');
    return json({ error: 'Server misconfigured' }, 500);
  }

  // Cloudflare injects CF-IPCountry automatically (absent in local dev)
  const country = request.headers.get('CF-IPCountry') ?? undefined;

  const ghlPayload: Record<string, unknown> = {
    email,
    locationId,
    tags: ['newsletter subscriber'],
    source: source ?? 'website',
    ...(country && { country }),
  };

  if (language && languageFieldId) {
    ghlPayload.customFields = [
      {
        id: languageFieldId,
        key: 'language',
        fieldValue: language,
      },
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
      console.error('GHL API error', ghlRes.status, text);
      return json({ error: 'Subscription failed' }, 502);
    }

    return json({ success: true }, 200);
  } catch (err) {
    console.error('Subscribe error:', err);
    return json({ error: 'Internal error' }, 500);
  }
};

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
