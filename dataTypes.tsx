export type User = {
    _id: string,
    username: string,
    email: string,
    isAdmin: boolean,
    img: string,
    isReporter: boolean,
    verified: boolean,
    autoDelete: Date,
    token: string,
    createdAt: Date,
    updatedAt: Date
}

export type Post = {
    _id: string,
    title: string,
    shortDescription: string,
    content: string,
    thumbnail: string,
    imgGallery: string[],
    category: string,
    authorId: User,
    view: number,
    isApproved: boolean,
    isPosted: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export type CommentType = {
    _id: string,
    content: string,
    postId: Post,
    userId: User,
    imgGallery: string[],
    type: 'thread'|'comment' ,
    refCommentIdTypeThread: string,
    refCommentUserId: User,
    isApproved: boolean,
    isReplied: boolean,
    createdAt: Date,
    updatedAt: Date
}

export type UserRole = 'Admin'|'Reporter'