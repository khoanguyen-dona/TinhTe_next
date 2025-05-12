export type User = {
    _id: string,
    username: string,
    email: string,
    isAdmin: boolean,
    img: string|'',
    isReporter: boolean,
    verified: boolean,
    autoDelete: Date,
    token: string,
}

export type Post = {
    _id: string,
    title: string,
    content: string,
    thumbnail: string,
    imgGallery: string[],
    category: string,
    authorId: string|User,
    view: number,
    isApproved: boolean,
    isPosted: boolean
}