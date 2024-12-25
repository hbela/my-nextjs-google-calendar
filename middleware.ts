import { type NextRequest, NextResponse } from "next/server";

export const config = { matcher: ["/auth/signin"] };

export async function middleware(request: NextRequest) {
  try {
    const flagRes = await fetch(
      `${request.nextUrl.origin}/api/flags/check?name=github-only-auth`,
      {
        method: "GET",
      }
    );
    const { value: githubOnly } = await flagRes.json();

    const version = githubOnly
      ? "auth/signin/github-only"
      : "auth/signin/regular";
    const url = request.nextUrl.clone();
    url.pathname = `/${version}`;

    return NextResponse.redirect(url);
  } catch (error) {
    // Fallback to regular signin if there's an error
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin/regular";
    return NextResponse.redirect(url);
  }
}
