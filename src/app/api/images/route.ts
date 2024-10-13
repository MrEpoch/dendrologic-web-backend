import { writeIntoBucket } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const fileSchema = z.string().base64();

export async function POST(request: NextRequest) {
  console.log("Api hit", new Date());
  try {
    const formData = await request.formData();
    const file = formData.get("image") as string;
    const validatedFile = fileSchema.safeParse(file);

    if (!validatedFile.success) {
      console.log("file not valid");
      return NextResponse.json({ success: false });
    }
    if (file == null) {
      console.log("file is null");
      return NextResponse.json({ success: false });
    } else if (!file.includes("base64")) {
      const fileName = crypto.randomUUID();
      const imageBuffer = Buffer.from(file, "base64");
      await writeIntoBucket(
        "dendrologic-bucket",
        fileName + ".jpg",
        imageBuffer,
      );
      return NextResponse.json({ success: true, fileName: fileName + ".jpg" });
    }
    const imageBuffer = Buffer.from(
      file.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );
    const fileName = crypto.randomUUID();
    const storageResponse = await writeIntoBucket(
      "dendrologic-bucket",
      fileName + "." + file.split(";")[0].split("/")[1],
      imageBuffer,
    );
    if (!storageResponse.success) {
      console.log("file is not stored");
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({
      success: true,
      fileName: fileName + "." + file.split(";")[0].split("/")[1],
    });
  } catch {
    console.log("idk, simple catch");
    return NextResponse.json({ success: false });
  }
}
