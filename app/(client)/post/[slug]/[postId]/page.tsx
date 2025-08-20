// app/posts/[id]/page.tsx
import { Metadata } from 'next';
import React from 'react';
import PostDetail from '@/app/(client)/custom-components/PostDetail';
import { Post } from '@/dataTypes';
import { publicRequest } from '@/requestMethod';
import NotFound from '@/app/(client)/custom-components/NotFound';


type PageProps = {
  params: {
    slug: string,
    postId: string
  }
}

async function getPostById(id: string) {

  try {
    const res = await publicRequest.get(`post/${id}`)

    if (!res.data) {
      if (res.status === 404) {
        console.warn(`Bài viết với ID ${id} không tìm thấy.`);
        return null; // Trả về null để xử lý 404
      }
  
      throw new Error(`Lỗi khi lấy bài viết: ${res.status} ${res.statusText}`);
    }
    const post = await res.data.post;
    return post;
  } catch (error) {
    console.error(`Không thể lấy bài viết với ID ${id}:`, error);
    return null; // Trả về null nếu có lỗi fetch
  }
}

// @ts-ignore
export async function generateMetadata({ params }: PageProps ): Promise<Metadata | null> {

  
  try {
    const { postId } = await Promise.resolve(params)

    const post = await getPostById(postId);

    if (!post) {
      // Nếu bài viết không tìm thấy, trả về metadata cho trang 404
      return {
        title: 'Bài viết không tìm thấy ',
        description: 'Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
        robots: 'noindex, nofollow', // Không lập chỉ mục trang lỗi
      };
    }

    return {
      title: `${post.title} | ${process.env.NEXT_PUBLIC_BROWSER_URL}`, // Tiêu đề trang
      description: post.shortDescription, // Mô tả trang
      keywords: post.title, // Từ khóa (tùy chọn, nhưng vẫn hữu ích)
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BROWSER_URL}/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`, // URL chính tắc của bài viết
      },
      openGraph: { // Metadata cho chia sẻ trên mạng xã hội (Facebook, Zalo)
        title: post.title,
        description: post.shortDescription,
        url: `${process.env.NEXT_PUBLIC_BROWSER_URL}/${post.title}/${post._id}`,
        images: [
          {
            url: post.thumbnail, // URL đầy đủ của hình ảnh đại diện bài viết
            width: 800,
            height: 450,
            alt: post.title,
          },
        ],
        type: 'article', // Loại nội dung là bài viết
        publishedTime: new Date(post.createdAt).toISOString(), // Thời gian xuất bản (nếu có trong dữ liệu bài viết)
        authors: [post.authorId.username], // Tên tác giả
      },
      twitter: { // Metadata cho chia sẻ trên Twitter
        card: 'summary_large_image', // Loại thẻ Twitter (summary, summary_large_image)
        title: post.title,
        description: post.shortDescription,
        images: [post.thumbnail],
      },
      // Các thẻ meta khác nếu cần (ví dụ: author, publisher)
    };

  } catch(error) {
    console.log('err',error)
    return null
  }
}

// @ts-ignore
export default async function PostPage({ params }: PageProps ) {
 
      const { postId, slug} = await Promise.resolve(params)
      const post = await getPostById(postId);
         
      if (!post) {
        return (
            <NotFound />
        );
      }
    
      return (
        <PostDetail postId={postId} slug={slug} data={post} /> 
      );

  
   
  
}
