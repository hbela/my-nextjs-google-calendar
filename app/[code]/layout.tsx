import { ReactNode } from "react";
import { unstable_deserialize as deserialize } from "@vercel/flags/next";
import { authFlags } from "@/lib/flags";
import { encrypt } from "@vercel/flags";
import { FlagValues } from "@vercel/flags/react";
import { Suspense } from "react";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { code: string };
}) {
  const values = await deserialize(authFlags, params.code);

  return (
    <>
      {children}
      <Suspense fallback={null}>
        <FlagValues values={await encrypt(values)} />
      </Suspense>
    </>
  );
}
