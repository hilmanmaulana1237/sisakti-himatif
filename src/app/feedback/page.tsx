"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconStar, IconStarFilled, IconArrowLeft, IconCheck, IconHeart } from "@tabler/icons-react";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Anonim", rating, message }),
      });
      if (res.ok) setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ["", "Sangat Buruk 😞", "Kurang Baik 😕", "Cukup Baik 🙂", "Baik 😊", "Sangat Baik 🤩"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white dark:from-brand-black dark:via-neutral-950 dark:to-brand-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-blue transition-colors mb-6">
          <IconArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>

        {!submitted ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 md:p-10 shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <Image src="/maskot/2.png" fill alt="SI SAKTI" className="object-contain" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
                Feedback untuk <span className="text-brand-blue">SI SAKTI</span>
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Masukan Anda sangat berharga untuk peningkatan layanan advokasi KASTRAD HIMATIF. Data ini akan dijadikan bahan laporan pertanggungjawaban kami.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Rating Stars */}
              <div className="text-center">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 block">
                  Seberapa puas Anda dengan layanan SI SAKTI?
                </label>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125"
                    >
                      {star <= (hoverRating || rating) ? (
                        <IconStarFilled className="w-10 h-10 text-yellow-400 drop-shadow-md" />
                      ) : (
                        <IconStar className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                      )}
                    </button>
                  ))}
                </div>
                {(hoverRating || rating) > 0 && (
                  <p className="text-sm text-neutral-500 font-medium">{ratingLabels[hoverRating || rating]}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Nama (opsional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-brand-blue transition-all"
                  placeholder="Nama kamu atau 'Anonim'"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Komentar / Saran</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-brand-blue transition-all resize-none"
                  placeholder="Ceritakan pengalaman kamu menggunakan SI SAKTI, saran perbaikan, atau hal-hal yang kamu sukai..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={rating === 0 || submitting}
                className="w-full py-4 rounded-xl bg-brand-blue hover:bg-brand-darkBlue text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? "Mengirim..." : <><IconHeart className="w-4 h-4" /> Kirim Feedback</>}
              </button>
            </form>
          </div>
        ) : (
          /* Success State */
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-10 shadow-xl text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <IconCheck className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Terima Kasih! 🎉</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8 leading-relaxed">
              Feedback kamu sudah berhasil terkirim dan akan menjadi bahan evaluasi kami di KASTRAD HIMATIF. Masukan ini sangat berarti untuk peningkatan layanan SI SAKTI.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-darkBlue text-white text-sm font-semibold transition-all">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-neutral-400 mt-6">
          Data feedback ini dikelola oleh KASTRAD HIMATIF untuk keperluan LPJ dan evaluasi program kerja.
        </p>
      </div>
    </div>
  );
}
