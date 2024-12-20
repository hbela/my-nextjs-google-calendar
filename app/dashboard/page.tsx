import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Welcome to your Dashboard</h1>
      <p className="text-xl mb-4">You are signed in as {session.user?.email}</p>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
        <ul className="list-disc pl-5">
          <li className="mb-2">Total Projects: 5</li>
          <li className="mb-2">Completed Tasks: 25</li>
          <li className="mb-2">Pending Tasks: 10</li>
        </ul>
      </div>
    </div>
  );
}
