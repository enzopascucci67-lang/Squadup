"use client";

import { useEffect, useState } from "react";
import { Button, Card, buttonClass } from "@/components/ui";

type Teammate = {
  id: string;
  name: string;
  image: string | null;
  avgRating: number;
  ratingCount: number;
};

const stars = [1, 2, 3, 4, 5];
const NOTE_LIMIT = 140;

export default function PastTeammatesPage() {
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/past-teammates")
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Could not load teammates");
        }
        return res.json();
      })
      .then(setTeammates)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const submitRating = async (toUserId: string, rating: number) => {
    setRequestingId(toUserId);
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, stars: rating, notes: notesById[toUserId] }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setToast(body.error || "Could not save rating");
      setTimeout(() => setToast(null), 2500);
      setRequestingId(null);
      return;
    }

    setToast("Rating saved!");
    setTimeout(() => setToast(null), 2500);
    setRequestingId(null);
    setNotesById(prev => ({ ...prev, [toUserId]: "" }));

    const refreshed = await fetch("/api/past-teammates").then(r => r.json());
    setTeammates(refreshed);
  };

  return (
    <main className="min-h-screen bg-animated-gradient bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Past Teammates</h1>
            <p className="text-sky-100">Rate the players you’ve teamed with.</p>
          </div>
          <a
            href="/dashboard"
            className={buttonClass({ variant: "outline", size: "md" })}
          >
            Back to Dashboard
          </a>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-40 animate-pulse rounded-2xl bg-white/15" />
            <div className="h-40 animate-pulse rounded-2xl bg-white/15" />
            <div className="h-40 animate-pulse rounded-2xl bg-white/15" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200/30 bg-red-500/20 px-6 py-4 text-sm font-semibold text-red-100 backdrop-blur-sm shadow-lg shadow-blue-900/25">
            {error}
          </div>
        )}

        {!loading && !error && teammates.length === 0 && (
          <Card className="px-6 py-8 text-center text-sky-100">
            You haven’t played with anyone yet. Send a request to start!
          </Card>
        )}

        {!loading && !error && teammates.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teammates.map(t => (
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
                      {t.ratingCount > 0
                        ? `${t.avgRating.toFixed(1)} stars (${t.ratingCount})`
                        : "No ratings yet"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {stars.map(s => (
                    <Button
                      key={s}
                      onClick={() => submitRating(t.id, s)}
                      disabled={requestingId === t.id}
                      variant="ghost"
                      size="sm"
                    >
                      {s}★
                    </Button>
                  ))}
                </div>
                <textarea
                  value={notesById[t.id] || ""}
                  onChange={e =>
                    setNotesById(prev => ({
                      ...prev,
                      [t.id]: e.target.value.slice(0, NOTE_LIMIT),
                    }))
                  }
                  placeholder="Optional note (e.g., great comms, chill)"
                  className="mt-3 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-sky-200 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                  rows={2}
                />
                <div className="mt-2 flex items-center justify-between text-xs text-sky-200">
                  <span>{NOTE_LIMIT - (notesById[t.id]?.length || 0)} left</span>
                  <a
                    href={`/u/${t.id}`}
                    className={buttonClass({ variant: "outline", size: "sm" })}
                  >
                    View Profile
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-xl border border-white/30 bg-gradient-to-r from-white to-sky-100 px-4 py-3 text-sm font-semibold text-blue-800 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          {toast}
        </div>
      )}
    </main>
  );
}
