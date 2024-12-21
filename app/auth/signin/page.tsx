import { authFlags } from "@/lib/flags";
import GitHubSignIn from "./github-only";
import RegularSignIn from "./regular";

export default async function SignIn() {
  // const isGithubOnly = await useGithubOnlyAuth();

  return authFlags ? <GitHubSignIn /> : <RegularSignIn />;
}
