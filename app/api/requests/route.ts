import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type RequestBody = {
  toDiscordId?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as RequestBody;
  if (!body.toDiscordId) {
    return NextResponse.json({ error: "Missing target user" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { discordId: body.toDiscordId },
    select: { id: true, discordId: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Target not found" }, { status: 404 });
  }

  const sender = await prisma.user.findUnique({
    where: { discordId: session.user.id },
    select: { id: true },
  });

  if (!sender) {
    return NextResponse.json({ error: "Sender not found" }, { status: 404 });
  }

  await prisma.teammateRequest.create({
    data: {
      fromUserId: sender.id,
      toUserId: target.id,
    },
  });

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Bot token not configured" },
      { status: 500 }
    );
  }

  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) {
    return NextResponse.json(
      { error: "Guild ID not configured" },
      { status: 500 }
    );
  }

  const channelName = `squad-up-${session.user.id.slice(-4)}-${target.id.slice(-4)}`;
  const channelRes = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/channels`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: channelName,
        type: 0,
        permission_overwrites: [
          {
            id: guildId,
            type: 0,
            deny: "1024",
          },
          {
            id: session.user.id,
            type: 1,
            allow: "68608",
          },
          {
            id: target.discordId,
            type: 1,
            allow: "68608",
          },
        ],
      }),
    }
  );

  if (!channelRes.ok) {
    const err = await channelRes.text();
    return NextResponse.json(
      { error: `Discord channel error: ${err}` },
      { status: 502 }
    );
  }

  const channel = await channelRes.json();
  const channelUrl = `https://discord.com/channels/${guildId}/${channel.id}`;

  const profileUrl = `${process.env.NEXTAUTH_URL}/u/${session.user.id}`;
  const message = `${session.user.name ?? "Someone"} wants to squad up! Join your private chat: ${channelUrl} | Profile: ${profileUrl}`;

  const createDmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: target.discordId }),
  });

  if (createDmRes.ok) {
    const dm = await createDmRes.json();
    await fetch(`https://discord.com/api/v10/channels/${dm.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });
  }

  const senderDmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: session.user.id }),
  });

  if (senderDmRes.ok) {
    const senderDm = await senderDmRes.json();
    await fetch(`https://discord.com/api/v10/channels/${senderDm.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `Your private chat is ready: ${channelUrl}`,
      }),
    });
  }

  await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `Welcome! Use this channel to coordinate your match. If you didn’t receive a DM, your DMs may be disabled—this channel is your shared space.`,
    }),
  });

  return NextResponse.json({ ok: true });
}
