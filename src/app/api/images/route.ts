import { ensureSuperTokensInit } from "@/config/backendConfig";
import { writeIntoBucket } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";
// import { z } from "zod";
import sharp from "sharp";
import { withSession } from "supertokens-node/nextjs";
import { z } from "zod";

// const fileSchema = z.string().base64();

ensureSuperTokensInit();

export async function POST(request: NextRequest) {
  return withSession(request, async (err, session) => {
    try {
      if (err) {
        console.error(err);
        return NextResponse.json({ success: false });
      }

      if (!session) {
        console.error("No session");
        return NextResponse.json({ success: false });
      }


      const jsonFile = await request.json();
      const file = jsonFile.image;
      const replacedFile = file.replace(/^data:image\/\w+;base64,/, "");
      const validatedFile = { data: replacedFile, success: true };
      /*      fileSchema.safeParse(
        replacedFile
      );*/

      if (!validatedFile.success) {
        return NextResponse.json({ success: false });
      }

      const fileName = crypto.randomUUID();
      const imageBuffer = await convertToJPG(
        Buffer.from(validatedFile.data, "base64"),
      );
      const storageResponse = await writeIntoBucket(
        "dendrologic-bucket",
        fileName + ".jpg",
        imageBuffer,
      );
      if (!storageResponse.success) {
        return NextResponse.json({ success: false });
      }

      return NextResponse.json({ success: true, fileName: fileName + ".jpg" });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ success: false });
    }
  });
}

async function convertToJPG(imageBuffer: Buffer) {
  try {
    // Convert the image to JPG format using sharp
    const jpgBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 90 }) // Adjust quality if needed
      .toBuffer();
    return jpgBuffer;
  } catch (err) {
    console.error("Error converting image to JPG:", err);
    throw err;
  }
}

export async function GET(request: NextRequest) {
  return withSession(request, async (err, session) => {
    try {
      if (err) {
        console.error(err);
        return NextResponse.json({ success: false });
      }

      if (!session) {
        console.error("No session");
        return NextResponse.json({ success: false });
      }
      const searchParams = request.nextUrl.searchParams;
      const searchParamsValidationZod = z.object({
        page: z.string(),
      })

      const validatedSearchParams = searchParamsValidationZod.safeParse(searchParams);

      if (!validatedSearchParams.success) {
        return NextResponse.json({ success: false });
      }



      return NextResponse.json({ success: true });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ success: false });
    }
  });
}
