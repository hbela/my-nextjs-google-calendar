import { unstable_flag as flag } from "@vercel/flags/next";

export const useGithubOnlyAuth = flag({
  key: "github-only-auth",
  decide: () => false, // default to false (regular auth)
});

// Export flags group for precomputation
export const authFlags = [useGithubOnlyAuth] as const;
