"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button, Card, buttonClass } from "@/components/ui";

const games = [
  { id: "apex", name: "Apex Legends", icon: "/icons/apex.png" },
  { id: "fortnite", name: "Fortnite", icon: "/icons/fortnite.png" },
];

const ranksByGame: Record<string, string[]> = {
  apex: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"],
  fortnite: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Elite", "Champion", "Unreal"],
};

const platforms = ["PC", "PlayStation", "Xbox", "Switch"];
const playstyles = ["Ranked", "Casual"];
const regions = ["NA", "EU", "LATAM", "OCE", "APAC", "MENA"];

const formatRank = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not set";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [game, setGame] = useState("");
  const [rank, setRank] = useState("");
  const [platform, setPlatform] = useState("");
  const [playstyle, setPlaystyle] = useState("");
  const [region, setRegion] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    game?: string;
    rank?: string;
    lastGame?: string;
    lastRank?: string;
    platform?: string;
    playstyle?: string;
    region?: string;
  } | null>(null);

  // Auto-load last selected game/rank
  useEffect(() => {
    if (!session) return;
    setLoadingProfile(true);
    fetch("/api/profile")
      .then(res => res.json())
      .then(user => {
        if (user) {
          setProfile(user);
          setGame(user.lastGame || "");
          setRank(user.lastRank || "");
          setPlatform(user.platform || "");
          setPlaystyle(user.playstyle || "");
          setRegion(user.region || "");
        }
      })
      .finally(() => setLoadingProfile(false));
  }, [session]);

  // Reset rank when game changes
  useEffect(() => setRank(""), [game]);

  const saveProfile = async () => {
    setError(null);
    if (!game || !rank || !platform || !playstyle || !region) {
      setError("Select a game, rank, platform, playstyle, and region first.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game, rank, platform, playstyle, region }),
    });
    if (!res.ok) {
      setSaving(false);
      setError("Save failed. Please try again.");
      return;
    }
    const updated = await res.json();
    setProfile(updated);
    setSaving(false);
    setToast("Profile saved!");
    setTimeout(() => setToast(null), 2500);
  };

  if (status === "loading")
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  if (!session)
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Sign in with Discord to continue
      </div>
    );

  const savedGameName =
    games.find(g => g.id === profile?.lastGame)?.name || "Not set";
  const savedRankName = formatRank(profile?.lastRank || "");
  const savedPlatform = profile?.platform || "Not set";
  const savedPlaystyle = profile?.playstyle || "Not set";
  const savedRegion = profile?.region || "Not set";
  const isComplete = !!(game && rank && platform && playstyle && region);

  return (
    <main className="min-h-screen bg-animated-gradient bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent">
            Squad Up
          </h1>
          <p className="text-lg text-sky-100">Welcome, {session.user?.name}</p>
        </div>

        {/* Profile Summary */}
        <section className="mb-10">
          <Card className="px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Your Profile</h2>
                <p className="text-sm text-sky-100">
                  {loadingProfile ? "Loading profile..." : "Last saved preferences"}
                </p>
              </div>
              {loadingProfile ? (
                <div className="flex gap-6 text-sm">
                  <div className="h-10 w-24 animate-pulse rounded bg-white/20" />
                  <div className="h-10 w-24 animate-pulse rounded bg-white/20" />
                  <div className="h-10 w-24 animate-pulse rounded bg-white/20" />
                  <div className="h-10 w-24 animate-pulse rounded bg-white/20" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <div className="uppercase tracking-wide text-sky-200">Game</div>
                    <div className="text-base font-semibold">{savedGameName}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wide text-sky-200">Rank</div>
                    <div className="text-base font-semibold">{savedRankName}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wide text-sky-200">Platform</div>
                    <div className="text-base font-semibold">{savedPlatform}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wide text-sky-200">Playstyle</div>
                    <div className="text-base font-semibold">{savedPlaystyle}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wide text-sky-200">Region</div>
                    <div className="text-base font-semibold">{savedRegion}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Game Selector */}
        <section className="flex flex-wrap justify-center gap-6 mb-8">
          {games.map(g => (
            <div
              key={g.id}
              onClick={() => setGame(g.id)}
              className={[
                "flex w-44 cursor-pointer flex-col items-center gap-2 rounded-xl border px-5 py-4 text-center transition duration-300 backdrop-blur-sm",
                g.id === game
                  ? "border-white bg-white/15 shadow-[0_0_25px_rgba(255,255,255,0.35)] scale-[1.04]"
                  : "border-white/40 bg-white/10 hover:scale-[1.04] hover:bg-white/15 hover:shadow-[0_0_18px_rgba(255,255,255,0.25)]",
              ].join(" ")}
            >
              <img src={g.icon} alt={g.name} width={60} height={60} />
              <p className={g.id === game ? "font-bold" : ""}>{g.name}</p>
            </div>
          ))}
        </section>

        {/* Rank Selector */}
        {game && (
          <section className="mb-8 flex flex-wrap justify-center gap-3">
            {ranksByGame[game].map(r => (
              <button
                key={r}
                onClick={() => setRank(r.toLowerCase())}
                className={[
                  "rounded-lg px-5 py-2 text-sm font-semibold transition hover:shadow-lg hover:shadow-blue-900/30",
                  r.toLowerCase() === rank
                    ? "bg-white text-blue-700 scale-105"
                    : "bg-white/30 text-white hover:bg-white/40",
                ].join(" ")}
              >
                {r}
              </button>
            ))}
          </section>
        )}

        {/* Platform + Playstyle */}
        <section className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="px-5 py-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-200">
              Platform
            </h3>
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
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-200">
              Playstyle
            </h3>
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
          <Card className="px-5 py-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-200">
              Region
            </h3>
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

        {error && (
          <div className="mb-6 rounded-xl border border-red-200/30 bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-100">
            {error}
          </div>
        )}

        {!error && !isComplete && (
          <div className="mb-6 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-sky-100">
            Pick a game, rank, platform, playstyle, and region to save your profile.
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={saveProfile}
            disabled={saving || !isComplete}
            variant="primary"
            size="lg"
          >
            {saving ? "Saving..." : "Save Profile"}
          </Button>
          <a
            href="/teammates"
            className={buttonClass({ variant: "outline", size: "lg" })}
          >
            Find Teammates
          </a>
          <a
            href="/past-teammates"
            className={buttonClass({ variant: "outline", size: "lg" })}
          >
            Past Teammates
          </a>
          <Button
            onClick={() => signOut()}
            variant="danger"
            size="lg"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-xl border border-white/30 bg-gradient-to-r from-white to-sky-100 px-4 py-3 text-sm font-semibold text-blue-800 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          {toast}
        </div>
      )}
    </main>
  );
}
