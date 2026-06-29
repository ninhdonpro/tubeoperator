const WP_API_URL = import.meta.env.WP_API_URL || 'https://member.tubeoperator.com/wp-json/wp/v2';

// Headers gửi kèm mọi request — một số WAF/bảo mật trước WordPress trả về 415/406
// nếu thiếu Accept/User-Agent chuẩn, gây fail build chập chờn trên Cloudflare.
const WP_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'tubeoperator-astro-build/1.0 (+https://tubeoperator.com)',
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface WpFetchOptions {
  retries?: number;
  timeoutMs?: number;
  // Khi true, body bắt buộc là mảng. Host đôi lúc trả HTTP 200 kèm object lỗi REST /
  // HTML trang chặn → coi là lỗi tạm thời và retry, tránh vỡ `.map()` lúc build.
  expectArray?: boolean;
}

// fetch WordPress với retry + backoff + timeout + validate body.
// Trả về { res, data } để caller đọc headers (vd. X-WP-TotalPages) khi cần.
async function wpFetch(
  path: string,
  { retries = 3, timeoutMs = 15000, expectArray = false }: WpFetchOptions = {},
): Promise<{ res: Response; data: any }> {
  const url = `${WP_API_URL}${path}`;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers: WP_HEADERS, signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        if (expectArray && !Array.isArray(data)) {
          throw new Error(
            `Expected array for ${path} but got ${typeof data}: ${JSON.stringify(data).slice(0, 200)}`,
          );
        }
        return { res, data };
      }
      // 404 là kết quả cuối (không tồn tại) — không retry. Các status khác (415, 429, 5xx...) thử lại.
      if (res.status === 404 || attempt === retries) {
        throw new Error(`Failed to fetch ${path}: ${res.status}`);
      }
      lastErr = new Error(`HTTP ${res.status} for ${path}`);
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
    } finally {
      clearTimeout(timer);
    }
    // Exponential backoff: 0.5s, 1s, 2s... (tối đa 8s) + jitter nhẹ.
    await delay(Math.min(500 * 2 ** attempt, 8000) + Math.floor(Math.random() * 250));
  }

  throw lastErr instanceof Error ? lastErr : new Error(`Failed to fetch ${path}`);
}

// Fetch danh sách bài viết
export async function getPosts(perPage: number = 10, page: number = 1) {
  const { data: posts, res } = await wpFetch(
    `/posts?per_page=${perPage}&page=${page}&_embed`,
    { expectArray: true },
  );
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1');
  const total = parseInt(res.headers.get('X-WP-Total') || '0');
  return { posts, totalPages, total };
}

// Fetch chi tiết bài viết theo slug
export async function getPostBySlug(slug: string) {
  const { data: posts } = await wpFetch(`/posts?slug=${slug}&_embed`, { expectArray: true });
  return posts[0] || null;
}

// Fetch danh sách pages
export async function getPages() {
  const { data } = await wpFetch(`/pages?per_page=100&_embed`, { expectArray: true });
  return data;
}

// Fetch chi tiết page theo slug
export async function getPageBySlug(slug: string) {
  const { data: pages } = await wpFetch(`/pages?slug=${slug}&_embed`, { expectArray: true });
  return pages[0] || null;
}

// Fetch danh sách categories
export async function getCategories() {
  const { data } = await wpFetch(`/categories?per_page=100`, { expectArray: true });
  return data;
}
