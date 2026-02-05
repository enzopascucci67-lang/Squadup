import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.teammateRequest.findMany({
    where: {
      OR: [
        { fromUserId: session.user.id },
        { toUserId: session.user.id },
      ],
    },
    select: {
      fromUser: { select: { id: true, name: true, image: true } },
      toUser: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const uniqueMap = new Map<string, { id: string; name: string; image: string | null }>();
  for (const req of requests) {
    const other =
      req.fromUser.id === session.user.id ? req.toUser : req.fromUser;
    if (!uniqueMap.has(other.id)) {
      uniqueMap.set(other.id, other);
    }
  }

  const teammateIds = Array.from(uniqueMap.keys());

  const ratings = await prisma.rating.groupBy({
    by: ["toUserId"],
    where: { toUserId: { in: teammateIds } },
    _avg: { stars: true },
    _count: { stars: true },
  });

  const ratingMap = new Map<
    string,
    { avg: number; count: number }
  >();
  ratings.forEach(r => {
    ratingMap.set(r.toUserId, {
      avg: r._avg.stars ?? 0,
      count: r._count.stars,
    });
  });

  const result = teammateIds.map(id => {
    const t = uniqueMap.get(id)!;
    const r = ratingMap.get(id);
    return {
      ...t,
      avgRating: r?.avg ?? 0,
      ratingCount: r?.count ?? 0,
    };
  });

  return NextResponse.json(result);
}
