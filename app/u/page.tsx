export default function PublicProfilesIndex() {
  return (
    <main className="min-h-screen bg-animated-gradient bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 px-6 py-8">
        <h1 className="text-2xl font-bold">Public Profiles</h1>
        <p className="mt-2 text-sky-100">
          Add an id to the URL like <span className="font-semibold">/u/123</span>.
        </p>
      </div>
    </main>
  );
}
