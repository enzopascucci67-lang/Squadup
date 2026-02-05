"use client";

import { useEffect, useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [fallingIcons, setFallingIcons] = useState<any[]>([]);

  useEffect(() => {
    const icons = [
      "/icons/bronze.png",
      "/icons/silver.png",
      "/icons/gold.png",
      "/icons/plat.png",
      "/icons/master.png",
      "/icons/pred.png",
      "/icons/bronzf.png",
      "/icons/silverf.png",
      "/icons/goldf.png",
      "/icons/platf.png",
      "/icons/diamondf.png",
      "/icons/elitef.png",
      "/icons/champf.png",
      "/icons/unrealf.png",
    ];

    const temp = Array.from({ length: 20 }).map((_, i) => {
      const src = icons[Math.floor(Math.random() * icons.length)];
      return {
        src,
        size: 20 + Math.random() * 30,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        rotate: Math.random() * 360,
        key: i,
      };
    });

    setFallingIcons(temp);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Falling background ranks */}
      <div className="pointer-events-none absolute inset-0">
        {fallingIcons.map(icon => (
          <img
            key={icon.key}
            src={icon.src}
            alt=""
            className="absolute -top-12 opacity-70"
            style={{
              left: `${icon.left}%`,
              width: `${icon.size}px`,
              height: `${icon.size}px`,
              animation: `fall ${icon.duration}s linear ${icon.delay}s infinite`,
              ["--spin" as any]: `${icon.rotate}deg`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-2 text-5xl font-black tracking-wide bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
          Squad Up
        </h1>

        <p className="mb-8 text-lg text-sky-200">
          Find teammates that match your skill and platform
        </p>

        {!session ? (
          <button
            onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
            className="mb-12 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-10 py-4 text-lg font-bold text-white transition hover:opacity-90"
          >
            Login with Discord
          </button>
        ) : (
          <div className="mb-12 flex flex-col items-center">
            <img
              src={session.user?.image ?? ""}
              alt="avatar"
              width={56}
              height={56}
              className="mb-2 rounded-full"
            />
            <p className="text-base">Welcome, {session.user?.name}</p>
            <button
              onClick={() => signOut()}
              className="mt-3 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-8 py-2 text-sm font-bold text-white transition hover:opacity-90"
            >
              Logout
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-16">
          <img
            src="/icons/apex.png"
            alt="Apex Legends"
            className="h-28 w-28"
          />
          <img
            src="/icons/fortnite.png"
            alt="Fortnite"
            className="h-28 w-28"
          />
        </div>
      </div>
    </main>
  );
}
