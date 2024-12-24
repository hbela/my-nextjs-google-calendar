import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { Role } from "@prisma/client";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === Role.ADMIN) {
    return <p>You are an admin, welcome!</p>;
  }

  return <p>You are not authorized to view this page!</p>;
}
