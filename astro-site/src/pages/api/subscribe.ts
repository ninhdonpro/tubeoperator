import type { APIRoute } from 'astro';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const { email, slug } = await request.json();

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_email' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Push to GoHighLevel via Inbound Webhook
    const env = (locals as any).runtime?.env;
    const webhookUrl = env?.GHL_WEBHOOK_URL;

    if (webhookUrl) {
      const ghlRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'blog-gate',
          slug,
          tags: ['blog-gate', `post:${slug}`],
        }),
      });

      if (!ghlRes.ok) {
        console.error('GHL webhook failed:', ghlRes.status);
        return new Response(JSON.stringify({ ok: false, error: 'ghl_failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Set subscriber cookie (1 year, HttpOnly)
    cookies.set('to_sub', '1', {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// This endpoint runs at the edge (SSR), not prerendered
export const prerender = false;
