const WP_API_URL = import.meta.env.WP_API_URL || 'https://member.tubeoperator.com/wp-json/wp/v2';

// Fetch danh sách bài viết
export async function getPosts(perPage: number = 10, page: number = 1) {
  const res = await fetch(`${WP_API_URL}/posts?per_page=${perPage}&page=${page}&_embed`);
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  const posts = await res.json();
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1');
  const total = parseInt(res.headers.get('X-WP-Total') || '0');
  return { posts, totalPages, total };
}

// Fetch chi tiết bài viết theo slug
export async function getPostBySlug(slug: string) {
  const res = await fetch(`${WP_API_URL}/posts?slug=${slug}&_embed`);
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
  const posts = await res.json();
  return posts[0] || null;
}

// Fetch danh sách pages
export async function getPages() {
  const res = await fetch(`${WP_API_URL}/pages?per_page=100&_embed`);
  if (!res.ok) throw new Error(`Failed to fetch pages: ${res.status}`);
  return await res.json();
}

// Fetch chi tiết page theo slug
export async function getPageBySlug(slug: string) {
  const res = await fetch(`${WP_API_URL}/pages?slug=${slug}&_embed`);
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  const pages = await res.json();
  return pages[0] || null;
}

// Fetch danh sách categories
export async function getCategories() {
  const res = await fetch(`${WP_API_URL}/categories?per_page=100`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  return await res.json();
}
