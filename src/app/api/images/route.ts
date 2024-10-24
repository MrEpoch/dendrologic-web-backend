import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/index";
import { geoRequestTable } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchParamsValidationZod = z.object({
      page: z.string().optional(),
    });

    const validatedSearchParams =
      searchParamsValidationZod.safeParse(searchParams);

    if (!validatedSearchParams.success) {
      return NextResponse.json({ success: false });
    }

    const page = validatedSearchParams.data.page || "1";
    const geoRequests = await db
      .select()
      .from(geoRequestTable)
      .limit(10)
      .offset((parseInt(page) - 1) * 10);

    return NextResponse.json({ success: true, geoRequests });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false });
  }
}
