export type User = {
    _id: string,
    username: string,
    description: string|''
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

export type ReportCommentType = {
    _id: string,
    postId: string,
    userId: string,
    commentId: string
}

export type ChatType = {
    _id: string,
    members: string[],
    lastMessage: string,
    senderId: string,
    isReceiverSeen: boolean,
    updatedAt: Date,
    createdAt: Date
}

export type MessageType = {
    _id: string,
    chatId: string,
    sender: string,
    text: string,
    imgs : string[],
    createdAt: Date|string,
    updatedAt: Date|string
}

export type MessageGroupChatType = {
    _id: string,
    avatar: string,
    username: string,
    chatId: string,
    sender: string,
    text: string,
    imgs : string[],
    createdAt: Date|string,
}

export type ArrivalMessageType = {
    chatId : string ,
    sender: string,
    receiverId: string,
    imgs: string[],
    text: string
}

export type NotificationType = {
    _id: string,
    userId: User|string ,
    content: string ,
    userIdRef: string|null ,
    usernameRef: string|null ,
    isReceiverSeen: boolean ,
    commentId: string|null ,
    refCommentIdTypeThread: string|null ,
    postSlug: string|null,
    postId: string|null,
    createdAt: Date
}

export type EmotionType = 'like'|'love'|'fun'|'sad'|'wow'
export type EmotionArray = ['like','love','fun','sad','wow']
export type UserRole = 'Admin'|'Reporter'