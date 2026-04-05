"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IconSearch, IconTicket, IconArrowLeft, IconClipboardCheck, IconClock, IconLoader2, IconAlertCircle, IconChecks } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

interface TicketResult {
  id: string;
  name: string;
  category: string;
  message: string;
  status: string;
  tindakLanjut: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
  "Menunggu": { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: IconClock, label: "Menunggu Tindak Lanjut" },
  "Diproses": { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: IconLoader2, label: "Sedang Diproses" },
  "Selesai":  { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30", icon: IconChecks, label: "Selesai Ditindaklanjuti" },
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const [ticketCode, setTicketCode] = useState("");
  const [result, setResult] = useState<TicketResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchTicket = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/aspirasi/track?ticket=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Tiket tidak ditemukan.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Gagal menghubungi server. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ticket = searchParams.get('ticket');
    if (ticket) {
      setTicketCode(ticket.toUpperCase());
      searchTicket(ticket);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    searchTicket(ticketCode);
  };

  const statusInfo = result ? STATUS_MAP[result.status] || STATUS_MAP["Menunggu"] : null;

  return (
    <main className="min-h-screen bg-white dark:bg-brand-black font-sans relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white dark:from-brand-black dark:via-neutral-950 dark:to-brand-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 md:py-20">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-blue transition-colors mb-10">
          <IconArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="relative w-24 h-24 mx-auto mb-5">
            <Image src="/maskot/4.png" fill alt="SI SAKTI Tracking" className="object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3">
            Lacak <span className="text-brand-blue">Aspirasi</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto text-sm leading-relaxed">
            Masukkan kode tiket yang Anda terima saat mengirim aspirasi untuk melihat status dan tindak lanjut dari KASTRAD HIMATIF.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <IconTicket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={ticketCode}
                onChange={e => setTicketCode(e.target.value.toUpperCase())}
                placeholder="Masukkan kode tiket, misal: ASP-K3F2AW"
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-900 dark:text-white font-mono text-sm tracking-wider focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-neutral-400 placeholder:font-sans placeholder:tracking-normal"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !ticketCode.trim()}
              className="px-6 py-4 bg-brand-blue hover:bg-brand-darkBlue text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-brand-blue/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              {loading ? <IconLoader2 className="w-5 h-5 animate-spin" /> : <IconSearch className="w-5 h-5" />}
              <span className="hidden md:inline">Lacak</span>
            </button>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex items-start gap-3 mb-6">
            <IconAlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
              <p className="text-xs text-neutral-500 mt-1">Pastikan kode tiket ditulis dengan benar (format: ASP-XXXXXX).</p>
            </div>
          </div>
        )}

        {/* Result Card */}
        {result && statusInfo && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
            {/* Ticket Header */}
            <div className="bg-neutral-50 dark:bg-neutral-950 px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                    <IconClipboardCheck className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Kode Tiket</p>
                    <p className="font-bold font-mono text-brand-blue tracking-wider text-lg">{result.id}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg} ${statusInfo.border} border`}>
                  <statusInfo.icon className={`w-4 h-4 ${statusInfo.color} ${result.status === "Diproses" ? "animate-spin" : ""}`} />
                  <span className={`text-xs font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-5">
              {/* Timeline */}
              <div className="space-y-4">
                {/* Step 1: Dikirim */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                      <IconChecks className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-800 mt-2" />
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">Aspirasi Terkirim</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{new Date(result.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <div className="mt-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1">{result.category}</p>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{result.message}</p>
                      <p className="text-[10px] text-neutral-400 mt-2">Pengirim: {result.name}</p>
                    </div>
                  </div>
                </div>

                {/* Step 2: Status */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${statusInfo.bg} border-2 ${statusInfo.border.replace('border-', 'border-')} flex items-center justify-center`}>
                      <statusInfo.icon className={`w-4 h-4 ${statusInfo.color} ${result.status === "Diproses" ? "animate-spin" : ""}`} />
                    </div>
                    {result.tindakLanjut && <div className="w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-800 mt-2" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">Status: {result.status}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{statusInfo.label}</p>
                  </div>
                </div>

                {/* Step 3: Tindak Lanjut */}
                {result.tindakLanjut && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-brand-blue/10 border-2 border-brand-blue flex items-center justify-center">
                        <IconClipboardCheck className="w-4 h-4 text-brand-blue" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">Tindak Lanjut KASTRAD</p>
                      <div className="mt-2 bg-brand-blue/5 rounded-xl p-4 border border-brand-blue/20">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{result.tindakLanjut}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-neutral-50 dark:bg-neutral-950 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-[10px] text-neutral-500 text-center">
                Untuk pertanyaan lebih lanjut, hubungi KASTRAD HIMATIF via WA: <span className="text-brand-blue font-semibold">087827718245</span>
              </p>
            </div>
          </div>
        )}

        {/* No search yet */}
        {!result && !error && !loading && (
          <div className="text-center py-8 opacity-50">
            <p className="text-sm text-neutral-500">Masukkan kode tiket di atas untuk memulai pencarian.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-brand-black flex items-center justify-center"><IconLoader2 className="w-8 h-8 text-brand-blue animate-spin" /></div>}>
      <TrackingContent />
    </Suspense>
  );
}
