"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge, Button, Card, buttonClass } from "@/components/ui";

const games = [
  { id: "apex", name: "Apex Legends", icon: "/icons/apex.png" },
  { id: "fortnite", name: "Fortnite", icon: "/icons/fortnite.png" },
];

const gameLabels: Record<string, string> = {
  apex: "Apex Legends",
  fortnite: "Fortnite",
};

const ranksByGame: Record<string, string[]> = {
  apex: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"],
  fortnite: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Elite", "Champion", "Unreal"],
};

const platforms = ["PC", "PlayStation", "Xbox", "Switch"];
const playstyles = ["Ranked", "Casual"];
const regions = ["NA", "EU", "LATAM", "OCE", "APAC", "MENA"];

type Teammate = {
  id: string;
  discordId: string;
  name: string;
  image: string | null;
  game: string | null;
  rank: string | null;
  platform: string | null;
  playstyle: string | null;
  region: string | null;
};

export default function TeammatesPage() {
  const { data: session, status } = useSession();
  const [game, setGame] = useState("");
  const [rank, setRank] = useState("");
  const [platform, setPlatform] = useState("");
  const [playstyle, setPlaystyle] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Teammate[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!game) {
      setResults([]);
      return;
    }

    const fetchTeammates = async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("game", game);
      if (rank) params.set("rank", rank);
      if (platform) params.set("platform", platform);
      if (playstyle) params.set("playstyle", playstyle);
      if (region) params.set("region", region);

      const res = await fetch(`/api/teammates?${params.toString()}`);
      if (!res.ok) {
        setLoading(false);
        setError("Could not load teammates.");
        return;
      }
      const data = await res.json();
      setResults(data);
      setLoading(false);
    };

    fetchTeammates();
  }, [game, rank, platform, playstyle, region]);

  if (status === "loading")
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading your squad view...
      </div>
    );

  const formatRank = (value: string | null) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : "Rank";

  return (
    <main className="min-h-screen bg-animated-gradient bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Find Teammates</h1>
            <p className="text-sky-100">Filter by game and rank.</p>
          </div>
          <a
            href="/dashboard"
            className={buttonClass({ variant: "outline", size: "md" })}
          >
            Back to Dashboard
          </a>
        </div>

        <section className="mb-6 grid gap-6 md:grid-cols-2">
          <Card className="px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-200">
              Game
            </h2>
            <div className="flex flex-wrap gap-3">
              {games.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGame(g.id);
                    setRank("");
                  }}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-semibold transition",
                    game === g.id
                      ? "bg-white text-blue-700"
                      : "bg-white/30 text-white hover:bg-white/40",
                  ].join(" ")}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </Card>
          <Card className="px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-200">
              Rank
            </h2>
            <div className="flex flex-wrap gap-3">
              {(ranksByGame[game] || []).map(r => (
                <button
                  key={r}
                  onClick={() => setRank(r.toLowerCase())}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-semibold transition",
                    rank === r.toLowerCase()
                      ? "bg-white text-blue-700"
                      : "bg-white/30 text-white hover:bg-white/40",
                  ].join(" ")}
                >
                  {r}
                </button>
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-6 grid gap-6 md:grid-cols-2">
          <Card className="px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-200">
              Platform
            </h2>
            <div className="flex flex-wrap gap-3">
              {platforms.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-semibold transition",
                    platform === p
                      ? "bg-white text-blue-700"
                      : "bg-white/30 text-white hover:bg-white/40",
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}
            </div>
          </Card>
          <Card className="px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-200">
              Playstyle
            </h2>
            <div className="flex flex-wrap gap-3">
              {playstyles.map(p => (
                <button
                  key={p}
                  onClick={() => setPlaystyle(p)}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-semibold transition",
                    playstyle === p
                      ? "bg-white text-blue-700"
                      : "bg-white/30 text-white hover:bg-white/40",
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-6">
          <Card className="px-5 py-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-200">
            Region
          </h2>
          <div className="flex flex-wrap gap-3">
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-semibold transition",
                  region === r
                    ? "bg-white text-blue-700"
                    : "bg-white/30 text-white hover:bg-white/40",
                ].join(" ")}
              >
                {r}
              </button>
            ))}
          </div>
          </Card>
        </section>

        <section className="mb-8 flex flex-wrap items-center gap-3">
          {(game || rank || platform || playstyle || region) ? (
            <>
              {game && (
                <button
                  onClick={() => setGame("")}
                  className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Game: {games.find(g => g.id === game)?.name} x
                </button>
              )}
              {rank && (
                <button
                  onClick={() => setRank("")}
                  className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Rank: {rank} x
                </button>
              )}
              {platform && (
                <button
                  onClick={() => setPlatform("")}
                  className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Platform: {platform} x
                </button>
              )}
              {playstyle && (
                <button
                  onClick={() => setPlaystyle("")}
                  className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Playstyle: {playstyle} x
                </button>
              )}
              {region && (
                <button
                  onClick={() => setRegion("")}
                  className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Region: {region} x
                </button>
              )}
              <button
                onClick={() => {
                  setGame("");
                  setRank("");
                  setPlatform("");
                  setPlaystyle("");
                  setRegion("");
                }}
                className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                Clear all
              </button>
            </>
          ) : (
            <div className="text-xs text-sky-200">No active filters</div>
          )}
        </section>

        <section className="mb-8">
          <Card className="px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Invite friends</h2>
              <p className="text-sm text-sky-100">
                Share a quick link to your profile.
              </p>
            </div>
            <Button
              onClick={() => {
                const publicId = session?.user?.id;
                const link = publicId
                  ? `${window.location.origin}/u/${publicId}`
                  : `${window.location.origin}/dashboard`;
                navigator.clipboard.writeText(link);
                setToast("Invite link copied!");
                setTimeout(() => setToast(null), 2500);
              }}
              variant="primary"
            >
              Copy Invite Link
            </Button>
          </div>
          </Card>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200/30 bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-100">
            {error}
          </div>
        )}

        {!error && game && (
          <div className="mb-4 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-sky-100">
            Matching within ±1 rank and nearby regions.
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <>
              <div className="h-40 animate-pulse rounded-2xl bg-white/15" />
              <div className="h-40 animate-pulse rounded-2xl bg-white/15" />
              <div className="h-40 animate-pulse rounded-2xl bg-white/15" />
            </>
          )}

          {!loading && game && results.length > 0 && (
            <div className="col-span-full mb-2 text-sm text-sky-100">
              Showing {results.length} teammates.
            </div>
          )}

          {!loading && !game && (
            <Card className="col-span-full px-6 py-8 text-center text-sky-100">
              Select a game to start discovering teammates.
            </Card>
          )}

          {!loading && game && results.length === 0 && (
            <Card className="col-span-full px-6 py-8 text-center text-sky-100">
              <div className="mb-4 text-lg font-semibold text-white">
                No teammates found yet.
              </div>
              <div className="mb-6">
                Try a different filter or invite friends to join your squad.
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="/dashboard"
                  className={buttonClass({ variant: "primary", size: "md" })}
                >
                  Update Profile
                </a>
                <Button
                  onClick={() => {
                    setGame("");
                    setRank("");
                    setPlatform("");
                    setPlaystyle("");
                    setRegion("");
                  }}
                  variant="outline"
                  size="md"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}

          {!loading &&
            results.map(t => (
              <Card key={t.id} hover className="px-5 py-4">
                <div className="mb-3 flex items-center gap-3">
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-white/20" />
                  )}
                  <div>
                    <div className="text-lg font-semibold">{t.name}</div>
                    <div className="text-xs uppercase tracking-wide text-sky-200">
                      {t.game ? gameLabels[t.game] || t.game : "Unknown game"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Badge>{formatRank(t.rank)}</Badge>
                  <Badge>{t.platform || "Platform"}</Badge>
                  <Badge>{t.playstyle || "Playstyle"}</Badge>
                  <Badge>{t.region || "Region"}</Badge>
                </div>
                <div className="mt-4 flex gap-3">
                  <a
                    href={`/u/${t.discordId}`}
                    className={[
                      buttonClass({ variant: "outline", size: "md" }),
                      "flex-1 text-center",
                    ].join(" ")}
                  >
                    View Profile
                  </a>
                  <Button
                    onClick={async () => {
                      try {
                        setRequestingId(t.id);
                        const res = await fetch("/api/requests", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ toDiscordId: t.discordId }),
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
                        setToast(`Request sent to ${t.name}!`);
                        setTimeout(() => setToast(null), 2500);
                      } catch (err: any) {
                        setToast(err.message || "Request failed");
                        setTimeout(() => setToast(null), 2500);
                      } finally {
                        setRequestingId(null);
                      }
                    }}
                    disabled={requestingId === t.id}
                    variant="primary"
                    className="flex-1"
                  >
                    {requestingId === t.id ? "Requesting..." : "Request"}
                  </Button>
                </div>
              </Card>
            ))}
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-xl border border-white/30 bg-gradient-to-r from-white to-sky-100 px-4 py-3 text-sm font-semibold text-blue-800 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          {toast}
        </div>
      )}
    </main>
  );
}
