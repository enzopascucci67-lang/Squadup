import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type Body = {
  toUserId?: string;
  stars?: number;
  notes?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Body;
  if (!body.toUserId || !body.stars) {
    return NextResponse.json(
      { error: "Missing rating data" },
      { status: 400 }
    );
  }

  if (body.stars < 1 || body.stars > 5) {
    return NextResponse.json(
      { error: "Stars must be between 1 and 5" },
      { status: 400 }
    );
  }

  const recent = await prisma.rating.findFirst({
    where: {
      fromUserId: session.user.id,
      toUserId: body.toUserId,
      createdAt: {
        gte: new Date(Date.now() - 10 * 60 * 1000),
      },
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  if (recent) {
    return NextResponse.json(
      { error: "Please wait a bit before rating again." },
      { status: 429 }
    );
  }

  await prisma.rating.create({
    data: {
      fromUserId: session.user.id,
      toUserId: body.toUserId,
      stars: body.stars,
      notes: body.notes?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}
