import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit, globalPOSTRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import { InsertImageIntoBucket } from "@/lib/storeFile";
import { addDendrologicImage } from "@/lib/dendrologic-image";
import requestIp from "request-ip";

// const fileSchema = z.string().base64();

const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting validation

    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const clientIp = await requestIp.getClientIp(request);
    if (clientIp !== null && !ipBucket.check(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    // User session validation

    const validateUser = await getCurrentSession();
    if (!validateUser.session || !validateUser.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    // Schema of request JSON data

    const validationSchema = z.object({
      image: z.any(),
      kod: z.string().min(1),
    });

    // It can fail if JSON is missing

    const jsonFile = await request.json();
    console.log(jsonFile.kod, "jsonFile");

    const validated = validationSchema.safeParse(jsonFile);
    if (!validated.success) {
      console.log("fail validation");
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    // Writes file into storage bucket and returns filename

    const file = await InsertImageIntoBucket(validated.data.image);
    console.log("after upload");

    if (!file.success) {
      return NextResponse.json({ success: false, error: "FILE_ERROR" });
    }

    if (!file.fileName) {
      return NextResponse.json({ success: false, error: "FILE_NAME_MISSING" });
    }

    // Adds filename to database

    const savedImage = await addDendrologicImage(
      validated.data.kod,
      file.fileName,
    );
    console.log(savedImage);

    if (!savedImage.success) {
      return NextResponse.json({ success: false, error: "DATABASE_ERROR" });
    }

    console.log("after upload");
    return NextResponse.json({ success: true, data: savedImage });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "BAD_REQUEST" });
  }
}
