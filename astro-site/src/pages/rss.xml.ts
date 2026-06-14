import rss from '@astrojs/rss';
import { getPosts } from '../lib/wordpress';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim();
}

export async function GET(context: any) {
  const { posts } = await getPosts(100);
  
  return rss({
    title: 'TubeOperator Blog',
    description: 'Creator education platform for YouTube + AI. Strategies, tools, and systems for creators.',
    site: context.site || 'https://tubeoperator.com',
    items: posts.map((post: any) => {
      const excerpt = post.excerpt?.rendered 
        ? stripHtml(post.excerpt.rendered)
        : '';
        
      return {
        title: post.title.rendered,
        pubDate: new Date(post.date),
        description: excerpt,
        link: `/${post.slug}`,
      };
    }),
    customData: `<language>en-us</language>`,
  });
}
