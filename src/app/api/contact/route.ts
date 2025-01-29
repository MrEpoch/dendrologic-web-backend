import { sendMail } from "@/lib/nodemailer";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalPOSTRateLimit } from "@/lib/request";
import { z } from "zod";
import requestIp from "request-ip";
import { NextRequest, NextResponse } from "next/server";

const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function POST(request: NextRequest) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const clientIp = await requestIp.getClientIp(request);
    if (clientIp !== null && !ipBucket.check(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const expectedData = z.object({
      subject: z
        .string()
        .min(3, "Zadejte prosím subjekt")
        .max(90, "Příliš dlouhý subjekt"),
      body: z
        .string()
        .min(3, "Zadejte prosím popis")
        .max(1000, "Příliš dlouhý popis"),
      email: z.string().email("Zadejte prosím platnou emailovou adresu"),
    });

    const data = await request.json();
    const parsedData = expectedData.safeParse(data);
    if (!parsedData.success) {
      return NextResponse.json({ error: "INVALID_DATA", success: false });
    }

    await sendMail({
      from: process.env.MAIL_FROM ?? "",
      to: process.env.MAIL_TO ?? "",
      subject: parsedData.data.subject,
      text: parsedData.data.body,
      html: `<p>${parsedData.data.body} + ${parsedData.data.email}</p>`,
    });

    return NextResponse.json({ success: true, error: null });
  } catch (e) {
    return NextResponse.json({ error: "UNKNOWN_ERROR", success: false });
  }
}
