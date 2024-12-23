import { unstable_flag as flag } from "@vercel/flags/next";

export const showGithubOnlyAuth = flag({
  key: "github-only-auth",
  description: "Show github only auth",
  decide: () => true, // default to false (regular auth)
});

// Export flags group for precomputation
export const authFlags = [showGithubOnlyAuth] as const;
