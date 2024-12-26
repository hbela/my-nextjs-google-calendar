import { NextResponse } from 'next/server'
import prisma from '@/prisma/db'

export async function GET() {
  const flags = await prisma.featureFlag.findMany()
  return NextResponse.json(flags)
}

export async function POST(req: Request) {
  const { name, value } = await req.json()
  const updatedFlag = await prisma.featureFlag.update({
    where: { name },
    data: { value },
  })
  return NextResponse.json(updatedFlag)
}

export async function PUT(req: Request) {
  const { name, value } = await req.json()
  const newFlag = await prisma.featureFlag.create({
    data: { name, value },
  })
  return NextResponse.json(newFlag)
}
