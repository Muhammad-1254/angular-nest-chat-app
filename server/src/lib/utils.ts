import { CookieOptions } from "express";



export const cookieOptions:CookieOptions = {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
}


export interface AuthUser{
    email:string,
    userId:string,
}