import { NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import { prisma } from "@/lib/prisma"

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "An error occurred fetching profile" },
      { status: 500 }
    )
  }
})

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, image } = body

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name,
        image,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "An error occurred updating profile" },
      { status: 500 }
    )
  }
})