import { CookieOptions } from "express";

const isProd =  process.env.NODE_ENV === 'production'

export const cookieOptions:CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd?'none':'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
    domain:process.env.FRONTEND_URL,
    path:'/'
}


export interface AuthUser{
    email:string,
    userId:string,
}