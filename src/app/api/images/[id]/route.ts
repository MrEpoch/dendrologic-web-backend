import { getCurrentSession } from "@/lib/sessionTokens";
import { InsertImageIntoBucket } from "@/lib/storeFile";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// const fileSchema = z.string().base64();

export async function POST(request: NextRequest, params: { id: string }) {
  try {
    const validateUser = await getCurrentSession();
    if (!validateUser.session || !validateUser.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    const id = z.string().safeParse(params?.id);

    if (!id.success) {
      return NextResponse.json({
        success: false,
        error: "UNKNOWN_GEO_REQUEST",
      });
    }

    const jsonFile = await request.json();

    const file = await InsertImageIntoBucket(jsonFile.image);

    if (!file.success) {
      return NextResponse.json({ success: false, error: "FILE_UPLOAD_ERROR" });
    }

    return NextResponse.json({ success: true, fileName: file.fileName });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "BAD_REQUEST" });
  }
}
