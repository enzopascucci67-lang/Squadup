import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const ranksByGame: Record<string, string[]> = {
  apex: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"],
  fortnite: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Elite", "Champion", "Unreal"],
};

const nearbyRegions: Record<string, string[]> = {
  NA: ["NA", "EU"],
  EU: ["EU", "NA"],
  LATAM: ["LATAM"],
  MENA: ["MENA"],
  APAC: ["APAC", "OCE"],
  OCE: ["OCE", "APAC"],
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const game = searchParams.get("game") || undefined;
  const rank = searchParams.get("rank") || undefined;
  const platform = searchParams.get("platform") || undefined;
  const playstyle = searchParams.get("playstyle") || undefined;
  const region = searchParams.get("region") || undefined;

  let rankFilter: string[] | undefined;
  if (rank) {
    const ranks = game ? ranksByGame[game] : undefined;
    if (ranks) {
      const normalized = ranks.map(r => r.toLowerCase());
      const idx = normalized.indexOf(rank.toLowerCase());
      if (idx !== -1) {
        rankFilter = normalized.slice(Math.max(0, idx - 1), idx + 2);
      } else {
        rankFilter = [rank.toLowerCase()];
      }
    } else {
      rankFilter = [rank.toLowerCase()];
    }
  }

  const regionFilter =
    region && nearbyRegions[region] ? nearbyRegions[region] : region ? [region] : undefined;

  const teammates = await prisma.user.findMany({
    where: {
      discordId: { not: session.user.id },
      ...(game ? { game } : {}),
      ...(rankFilter ? { rank: { in: rankFilter } } : {}),
      ...(platform ? { platform } : {}),
      ...(playstyle ? { playstyle } : {}),
      ...(regionFilter ? { region: { in: regionFilter } } : {}),
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
    take: 12,
  });

  return NextResponse.json(teammates);
}
