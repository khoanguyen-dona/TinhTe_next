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