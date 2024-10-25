import { RefillingTokenBucket } from "./rate-limit";
import requestIp from "request-ip";
import { NextRequest } from "next/server";

export const globalBucket = new RefillingTokenBucket<string>(100, 1);

export function globalGETRateLimit(req: NextRequest): boolean {
  // Note: Assumes X-Forwarded-For will always be defined.
  const clientIP = requestIp.getClientIp(req);
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 1);
}

export function globalPOSTRateLimit(req: NextRequest): boolean {
  // Note: Assumes X-Forwarded-For will always be defined.
  const clientIP = requestIp.getClientIp(req);
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 3);
}
