"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Card, buttonClass } from "@/components/ui";

type PublicUser = {
  discordId: string;
  name: string;
  image: string | null;
  game: string | null;
  rank: string | null;
  platform: string | null;
  playstyle: string | null;
  region: string | null;
  avgRating: number;
  ratingCount: number;
};

const gameLabels: Record<string, string> = {
  apex: "Apex Legends",
  fortnite: "Fortnite",
};

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/public-profile?userId=${encodeURIComponent(userId)}`)
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Profile not found");
        }
        return res.json();
      })
      .then(setUser)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) {
    return (
      <main className="min-h-screen bg-animated-gradient bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 px-6 py-8">
          <div className="text-2xl font-bold">Profile not found</div>
          <div className="mt-4 text-sm text-sky-100">
            Missing user id in URL.
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-animated-gradient bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 px-6 py-8">
          <div className="h-6 w-40 animate-pulse rounded bg-white/20" />
          <div className="mt-4 h-4 w-64 animate-pulse rounded bg-white/20" />
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-animated-gradient bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 px-6 py-8">
          <div className="text-2xl font-bold">Profile not found</div>
          <div className="mt-4 text-sm text-sky-100">{error ?? "Not found"}</div>
        </div>
      </main>
    );
  }

  const rankLabel = user.rank
    ? user.rank.charAt(0).toUpperCase() + user.rank.slice(1)
    : "Not set";
  const gameLabel = user.game ? gameLabels[user.game] || user.game : "Not set";
  const ratingLabel =
    user.ratingCount > 0
      ? `${user.avgRating.toFixed(1)} stars (${user.ratingCount})`
      : "No ratings yet";

  return (
    <main className="min-h-screen bg-animated-gradient bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Player Profile</h1>
            <p className="text-sky-100">Squad Up public card</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setToast("Invite link copied!");
                setTimeout(() => setToast(null), 2500);
              }}
              variant="primary"
            >
              Copy Invite Link
            </Button>
            <Button
              onClick={async () => {
                if (!user?.discordId) return;
                try {
                  setRequesting(true);
                  const res = await fetch("/api/requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ toDiscordId: user.discordId }),
                  });
                  if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    const msg = (body.error as string) || "Request failed";
                    if (msg.includes("Cannot send messages to this user")) {
                      throw new Error(
                        "DMs are disabled. Please enable DMs from server members."
                      );
                    }
                    throw new Error(msg);
                  }
                  setToast("Request sent!");
                  setTimeout(() => setToast(null), 2500);
                } catch (err: any) {
                  setToast(err.message || "Request failed");
                  setTimeout(() => setToast(null), 2500);
                } finally {
                  setRequesting(false);
                }
              }}
              disabled={requesting}
              variant="outline"
            >
              {requesting ? "Requesting..." : "Request Teammate"}
            </Button>
            <a
              href="/"
              className={buttonClass({ variant: "outline", size: "md" })}
            >
              Home
            </a>
          </div>
        </div>

        <Card className="rounded-3xl px-6 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-20 w-20 rounded-full border border-white/30"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-white/20" />
            )}
            <div>
              <div className="text-2xl font-bold">{user.name}</div>
              <div className="text-sm text-sky-100">Looking for teammates</div>
              <div className="mt-2 text-sm text-sky-100">
                {ratingLabel}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/20 bg-white/5 px-5 py-4">
              <div className="text-xs uppercase tracking-wide text-sky-200">
                Game
              </div>
              <div className="text-lg font-semibold">{gameLabel}</div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/5 px-5 py-4">
              <div className="text-xs uppercase tracking-wide text-sky-200">
                Rank
              </div>
              <div className="text-lg font-semibold">{rankLabel}</div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/5 px-5 py-4">
              <div className="text-xs uppercase tracking-wide text-sky-200">
                Platform
              </div>
              <div className="text-lg font-semibold">{user.platform || "Not set"}</div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/5 px-5 py-4">
              <div className="text-xs uppercase tracking-wide text-sky-200">
                Playstyle
              </div>
              <div className="text-lg font-semibold">{user.playstyle || "Not set"}</div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/5 px-5 py-4">
              <div className="text-xs uppercase tracking-wide text-sky-200">
                Region
              </div>
              <div className="text-lg font-semibold">{user.region || "Not set"}</div>
            </div>
          </div>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-xl border border-white/30 bg-gradient-to-r from-white to-sky-100 px-4 py-3 text-sm font-semibold text-blue-800 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          {toast}
        </div>
      )}
    </main>
  );
}
