'use server';

import { cookies } from "next/headers";

export async function deleteSessionCookie() {
  const cookies_instance = await cookies();
  cookies_instance.delete("session");

  return {};
}
