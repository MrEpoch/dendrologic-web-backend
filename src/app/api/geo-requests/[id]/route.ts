import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/index";
import { geoRequestTable } from "@/db/schema";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit } from "@/lib/request";
import requestIp from "request-ip";
import { eq } from "drizzle-orm";

const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { 
    if (!globalGETRateLimit(request)) {
      console.log("get");
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const clientIp = requestIp.getClientIp(request);
    if (clientIp !== null && !ipBucket.check(clientIp, 1)) {
      console.log("ip");
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const searchParamsValidationZod = z.object({
      id: z.string().length(36),
    });

    const id = (await params)?.id;

    const validatedParams =
      searchParamsValidationZod.safeParse({id});

    if (!validatedParams.success) {
      console.log("bad", id);
      return NextResponse.json({ success: false });
    }

    const geoRequests = await db
      .select()
      .from(geoRequestTable)
      .where(eq(geoRequestTable.id, validatedParams.data.id))

    return NextResponse.json({ success: true, geoRequests: geoRequests[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false });
  }
}
