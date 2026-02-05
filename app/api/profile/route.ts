// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { discordId: session.user.id },
  });

  return NextResponse.json(user || {});
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const updatedUser = await prisma.user.upsert({
    where: { discordId: session.user.id },
    update: {
      game: data.game,
      rank: data.rank,
      lastGame: data.game,
      lastRank: data.rank,
      platform: data.platform,
      playstyle: data.playstyle,
      region: data.region,
    },
    create: {
      discordId: session.user.id,
      name: session.user.name || "Unknown",
      image: session.user.image || null,
      game: data.game,
      rank: data.rank,
      lastGame: data.game,
      lastRank: data.rank,
      platform: data.platform,
      playstyle: data.playstyle,
      region: data.region,
    },
  });

  return NextResponse.json(updatedUser);
}
