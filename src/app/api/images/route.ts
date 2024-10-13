import { writeIntoBucket } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sharp from "sharp";

const fileSchema = z.string().base64();

export async function POST(request: NextRequest) {
  console.log("Api hit", new Date());
  try {
    const formData = await request.formData();
    const file = formData.get("image") as string;
    const validatedFile = fileSchema.safeParse(file.replace(/^data:image\/\w+;base64,/, ""));

    if (!validatedFile.success) {
      console.log("file not valid", file);
      return NextResponse.json({ success: false });
    }
    if (file == null) {
      console.log("file is null");
      return NextResponse.json({ success: false });
    } else if (!validatedFile.data.includes("base64")) {
      const fileName = crypto.randomUUID()
      const imageBuffer = await convertToJPG(Buffer.from(validatedFile.data, "base64"));
      const storageResponse = await writeIntoBucket(
        "dendrologic-bucket",
        fileName + ".jpg",
        imageBuffer,
      );
      if (!storageResponse.success) {
        console.log("file is not stored");
        return NextResponse.json({ success: false });
      }

      return NextResponse.json({ success: true, fileName: fileName + ".jpg" });
    }
  } catch {
    console.log("idk, simple catch");
    return NextResponse.json({ success: false });
  }
}

async function convertToJPG(imageBuffer: Buffer) {
    try {
        // Convert the image to JPG format using sharp
        const jpgBuffer = await sharp(imageBuffer)
            .jpeg({ quality: 90 })  // Adjust quality if needed
            .toBuffer();
        return jpgBuffer;
    } catch (err) {
        console.error('Error converting image to JPG:', err);
        throw err;
    }
}
