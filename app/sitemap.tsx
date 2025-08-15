
import { Post } from '@/dataTypes';
import { MetadataRoute } from 'next';

async function getAllPosts(): Promise<Post[]> {
  try {

    // Gọi API của backend để lấy danh sách tất cả bài viết
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/post?page=1&limit=99999`, {
      next: { revalidate: 3600 }
    }).then((res) => res.json())

    if (res.posts.length === 0) {
      console.error(`Lỗi khi lấy bài viết cho sitemap: ${res.status}`);
      return []; // Trả về mảng rỗng nếu có lỗi
    }
    const posts: Post[] = res.posts;
    return posts;
  } catch (error) {
    console.error('Không thể lấy bài viết cho sitemap:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const baseUrl = process.env.NEXT_PUBLIC_BROWSER_URL // Đảm bảo đây là URL chính thức của trang web bạn

  // Lấy tất cả bài viết để tạo URL động
  const posts = await getAllPosts();

  // Tạo các mục sitemap cho các trang tĩnh
  const staticPages: MetadataRoute.Sitemap = [
      {
          url: `${baseUrl}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 1.0,
      },
      {
          url: `${baseUrl}/login`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
      },
      {
          url: `${baseUrl}/register`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
      },
      {
          url: `${baseUrl}/forums`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
      },
      {
          url: `${baseUrl}/xe`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
      },
      {
          url: `${baseUrl}/may-tinh`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
      },
      {
          url: `${baseUrl}/dien-thoai`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
      },
      
  ];


  const postPages: MetadataRoute.Sitemap = posts.map((post: Post) => ({
      url: `${baseUrl}/post/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`, // Cấu trúc URL của bạn
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(), // Sử dụng thời gian cập nhật của bài viết
      changeFrequency: 'monthly', // Tần suất thay đổi của bài viết
      priority: 0.9, // Mức độ ưu tiên của bài viết
  }));

  // Kết hợp các trang tĩnh và trang động
  
  return [...staticPages, ...postPages];

}
