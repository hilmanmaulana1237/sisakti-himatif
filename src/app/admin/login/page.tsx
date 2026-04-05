"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLock, IconMail, IconArrowRight, IconShieldCheck } from "@tabler/icons-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Gagal masuk");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 font-sans selection:bg-brand-blue/30 selection:text-brand-blue">
      <div className="w-full max-w-md bg-neutral-900/40 backdrop-blur-2xl border border-neutral-800 p-8 md:p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden">

        {/* Glow efek latar belakang */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-blue to-transparent"></div>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-blue/10 blur-[100px] rounded-full"></div>

        <div className="relative z-10">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-black border border-neutral-800 mb-6 shadow-xl text-brand-blue">
              <IconShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Portal <span className="text-brand-blue">KASTRAD</span></h1>
            <p className="text-brand-gray mt-2 text-sm leading-relaxed">Masuk ke pusat pengelolaan pengaduan SI SAKTI mahasiswa Informatika.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-medium text-brand-gray ml-1">Email Administrator</label>
              <div className="relative">
                <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-neutral-800 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-brand-gray/30 focus:outline-none focus:border-brand-blue transition-all font-light"
                  placeholder="admin@kastrad.himatif"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-medium text-brand-gray ml-1">Kata Sandi</label>
              <div className="relative">
                <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray/50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 border border-neutral-800 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-brand-gray/30 focus:outline-none focus:border-brand-blue transition-all font-light tracking-widest"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-4 rounded-2xl bg-brand-blue text-white font-semibold text-base hover:bg-brand-darkBlue transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? "Memverifikasi..." : "Akses Dashboard"}
              {!loading && <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
