import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ discordId: userId }, { id: userId }],
    },
    select: {
      id: true,
      discordId: true,
      name: true,
      image: true,
      game: true,
      rank: true,
      platform: true,
      playstyle: true,
      region: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rating = await prisma.rating.aggregate({
    where: { toUserId: user.id },
    _avg: { stars: true },
    _count: { stars: true },
  });

  return NextResponse.json({
    ...user,
    avgRating: rating._avg.stars ?? 0,
    ratingCount: rating._count.stars,
  });
}
