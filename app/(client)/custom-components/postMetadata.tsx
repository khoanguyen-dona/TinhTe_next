import React from 'react'
import Head from 'next/head'

export default function  postMetadata( {postTitle, postDesc, postImg}:{ postTitle: string, postDesc: string, postImg: string} ) {
    return (
        <> 
            <Head>
            <title>{postTitle} | Tên Blog Của Bạn</title>
            <meta name="description" content={postDesc} />
            <meta name="keywords" content={postTitle} />
            <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BROWSER_URL}/post/${postTitle}`} />

            {/* Open Graph Tags for Social Media */}
            <meta property="og:title" content={postTitle} />
            <meta property="og:description" content={postDesc} />
            <meta property="og:image" content={postImg} />
            <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BROWSER_URL}/post/${postTitle}`} />
            <meta property="og:type" content="article" />

          
            </Head>

        </>
    )
}
// export default postMetadata