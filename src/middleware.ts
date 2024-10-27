// middleware.ts
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:8100",
  "http://localhost:3752",
  "https://dendrologic-web.stencukpage.com",
];

const allowedHeaderOriginHosts = [
  "localhost:8100",
  "localhost:3752",
  "dendrologic-web.stencukpage.com",
];

const allowedAccessControlAllowHeaders = [
  "Content-Type",
  "Authorization-Session",
  "Authorization-Password-Session",
  "Authorization-Email",
];

const allowedAccessControlAllowMethods = ["GET", "POST", "OPTIONS"];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const originHeader =
    request.headers.get("Origin") ?? request.headers.get("X-Forwarded-Host");
  const hostHeader = request.headers.get("Host");
  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, {
      status: 403,
    });
  }

  if (request.method === "GET") {
    const res = NextResponse.next();
    if (allowedOrigins.includes(originHeader)) {
      res.headers.append("Access-Control-Allow-Origin", originHeader);
    }

    // add the remaining CORS headers to the response
    res.headers.append("Access-Control-Allow-Credentials", "true");
    res.headers.append(
      "Access-Control-Allow-Methods",
      allowedAccessControlAllowMethods.join(","),
    );
    res.headers.append(
      "Access-Control-Allow-Headers",
      allowedAccessControlAllowHeaders.join(",").toLowerCase(),
    );
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
    console.log(res);
    return res;
  }

  // NOTE: You may need to use `X-Forwarded-Host` instead
  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    return new NextResponse(null, {
      status: 403,
    });
  }
  if (!allowedHeaderOriginHosts.includes(origin.host)) {
    return new NextResponse(null, {
      status: 403,
    });
  }

  const res = NextResponse.next();
  // if the origin is an allowed one,
  // add it to the 'Access-Control-Allow-Origin' header
  if (allowedOrigins.includes(originHeader)) {
    res.headers.append("Access-Control-Allow-Origin", originHeader);
  }

  // add the remaining CORS headers to the response
  res.headers.append("Access-Control-Allow-Credentials", "true");
  res.headers.append(
    "Access-Control-Allow-Methods",
    allowedAccessControlAllowMethods.join(","),
  );
  res.headers.append(
    "Access-Control-Allow-Headers",
    allowedAccessControlAllowHeaders.join(",").toLowerCase(),
  );

  return res;
}
