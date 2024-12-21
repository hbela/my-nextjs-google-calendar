import { type NextRequest, NextResponse } from "next/server";
import { showGithubOnlyAuth } from "@/lib/flags";

export const config = {
  matcher: ["/auth/signin"],
};

export async function middleware(request: NextRequest) {
  const githubOnly = await showGithubOnlyAuth();

  // Determine which version to show based on the feature flag
  const version = githubOnly
    ? "/auth/signin/github-only"
    : "/auth/signin/regular";

  const nextUrl = new URL(version, request.url);

  return NextResponse.rewrite(nextUrl);
}
