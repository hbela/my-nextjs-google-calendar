import { NextResponse } from "next/server";
import prisma from "@/prisma/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ value: false });
  }

  const flag = await prisma.featureFlag.findFirst({
    where: { name },
  });

  return NextResponse.json({ value: flag?.value ?? false });
}
