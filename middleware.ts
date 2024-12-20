import { type NextRequest, NextResponse } from "next/server";
import { unstable_precompute as precompute } from "@vercel/flags/next";
import { authFlags } from "./lib/flags";

export const config = {
  matcher: ["/auth/signin"],
};

export async function middleware(request: NextRequest) {
  const code = await precompute(authFlags);

  // Rewrite the request to include the precomputed code
  const nextUrl = new URL(
    `/${code}${request.nextUrl.pathname}${request.nextUrl.search}`,
    request.url
  );

  return NextResponse.rewrite(nextUrl, { request });
}
