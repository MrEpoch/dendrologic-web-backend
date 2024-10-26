// middleware.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:8100",
  "http://localhost:3752",
  "https://dendrologic-web.stencukpage.com"
]

const allowedHeaderOriginHosts = [
  "localhost:8100",
  "localhost:3752",
  "dendrologic-web.stencukpage.com"
]

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");
  if (originHeader === null || hostHeader === null) {
    console.log("some is null");
    return new NextResponse(null, {
      status: 403,
    });
  }

  console.log(cookies());

  if (request.method === "GET") {
      const res = NextResponse.next();
      if (allowedOrigins.includes(originHeader)) {
        res.headers.append('Access-Control-Allow-Origin', originHeader);
      }

      // add the remaining CORS headers to the response
      res.headers.append('Access-Control-Allow-Credentials', "true")
      res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
      res.headers.append(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
    const token = request.cookies.get("session")?.value ?? null;
    if (token !== null) {
      // Only extend cookie expiration on GET requests since we can be sure
      // a new session wasn't set when handling the request.
      res.cookies.set("session", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
    return res;
  }

  // NOTE: You may need to use `X-Forwarded-Host` instead
  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    console.log("non convertable");
    return new NextResponse(null, {
      status: 403,
    });
  }
  if (!allowedHeaderOriginHosts.includes(origin.host)) {
    console.log(origin.host, hostHeader);
    console.log("origin.host is not hostHeader");
    return new NextResponse(null, {
      status: 403,
    });
  }

  const res = NextResponse.next();
    // if the origin is an allowed one,
  // add it to the 'Access-Control-Allow-Origin' header
  if (allowedOrigins.includes(originHeader)) {
    res.headers.append('Access-Control-Allow-Origin', originHeader);
  }

  // add the remaining CORS headers to the response
  res.headers.append('Access-Control-Allow-Credentials', "true")
  res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
  res.headers.append(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  return res;
}
