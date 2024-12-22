import { type NextRequest, NextResponse } from "next/server";
import { showGithubOnlyAuth } from "@/lib/flags";

export const config = { matcher: ["/auth/signin"] };

export async function middleware(request: NextRequest) {
  const githubOnly = await showGithubOnlyAuth();
  console.log("githubOnly: ", githubOnly);

  //const rootUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  // Determine which version to show based on the feature flag
  const version = githubOnly
    ? "auth/signin/github-only"
    : "auth/signin/regular";
  console.log("version: ", version);

  //const nextUrl = new URL(version, rootUrl);

  const url = request.nextUrl.clone();
  url.pathname = `/${version}`;

  console.log("url: ", url);

  return NextResponse.redirect(url);
}
