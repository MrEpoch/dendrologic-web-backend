import { RefillingTokenBucket } from "./rate-limit";
import requestIp from "request-ip";
import { NextRequest } from "next/server";
import { headers } from "next/headers";

export const globalBucket = new RefillingTokenBucket<string>(100, 1);

export function globalGETRateLimit(req: NextRequest): boolean {
  // Note: Assumes X-Forwarded-For will always be defined.
  const clientIP = requestIp.getClientIp(req);
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 1);
}

export async function globalGETRateLimitNext(): Promise<boolean> {
  const fallBack = "0.0.0.0";
  let ip = await headers().get("x-forwarded-for");
  if (!ip) {
    ip = await headers().get("x-real-ip") ?? fallBack;
  } else ip.split(",")[0];

  if (ip === null) {
    return true;
  }
  return globalBucket.consume(ip, 1);
}

export function globalPOSTRateLimit(req: NextRequest): boolean {
  // Note: Assumes X-Forwarded-For will always be defined.
  const clientIP = requestIp.getClientIp(req);
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 3);
}
