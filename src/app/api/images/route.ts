import { writeIntoBucket } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sharp from "sharp";

const fileSchema = z.string().base64();

export async function POST(request: NextRequest) {
  console.log("Api hit", new Date());
  try {
    console.log("after parsing -2");
    console.log(request);
    const jsonFile = await request.json();
    console.log("after parsing -1");
    const file = jsonFile.image;
    console.log("after parsing 0");
    const replacedFile = file.replace(/^data:image\/\w+;base64,/, "");
    console.log("after parsing 0.5");
    const validatedFile = { data: replacedFile, success: true }
/*      fileSchema.safeParse(
      replacedFile
    );*/
    console.log("after parsing 1");

    if (!validatedFile.success) {
      console.log("file not valid", file);
      return NextResponse.json({ success: false });
    }
    console.log("after parsing 2");

    const fileName = crypto.randomUUID();
    const imageBuffer = await convertToJPG(
      Buffer.from(validatedFile.data, "base64"),
    );
    console.log("after parsing 3");
    const storageResponse = await writeIntoBucket(
      "dendrologic-bucket",
      fileName + ".jpg",
      imageBuffer,
    );
    console.log("after parsing 4");
    if (!storageResponse.success) {
      console.log("file is not stored");
      return NextResponse.json({ success: false });
    }

    console.log("after parsing 5");
    return NextResponse.json({ success: true, fileName: fileName + ".jpg" });
  } catch (e) {
    console.error(e);
    console.log("idk, simple catch");
    return NextResponse.json({ success: false });
  }
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
