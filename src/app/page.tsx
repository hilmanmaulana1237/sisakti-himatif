"use client";

import { useState, useEffect, useRef } from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ChatBubble } from "@/components/ui/chat-bubble";
import {
  IconHome, IconInfoCircle, IconMessage, IconShieldCheck, IconBooks,
  IconSpeakerphone, IconGavel, IconBrandWhatsapp, IconBrandMedium,
  IconRobotFace, IconArrowRight, IconSchool, IconHeartHandshake,
  IconChevronLeft, IconChevronRight, IconExternalLink, IconHistory, IconX, IconInbox, IconUser,
  IconCopy, IconTicket, IconCheck, IconBook
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

interface Article {
  id: string; title: string; badge: string; description: string;
  link: string; maskotImage: string; createdAt: string;
}

/* ─── Counter Hook ─── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [started, target, duration]);

  return { count, ref };
}

/* ─── Gallery Scroll ─── */
function MaskotGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  const imgs = ["/maskot/1.png", "/maskot/2.png", "/maskot/3.png", "/maskot/4.png", "/maskot/5.png", "/maskot/6.webp"];
  return (
    <div className="relative">
      <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-full flex items-center justify-center shadow-lg hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all"><IconChevronLeft className="w-5 h-5" /></button>
      <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-full flex items-center justify-center shadow-lg hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all"><IconChevronRight className="w-5 h-5" /></button>
      <div ref={scrollRef} className="flex gap-6 overflow-x-auto scroll-hide px-12 py-8 snap-x snap-mandatory">
        {imgs.map((src, i) => (
          <div key={i} className="snap-center shrink-0 w-[260px] h-[320px] bg-gradient-to-br from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-950 rounded-3xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center p-6 hover:border-brand-blue/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all group">
            <Image src={src} width={200} height={260} alt={`SI SAKTI pose ${i + 1}`} className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ MAIN PAGE ═══════════ */
export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [formData, setFormData] = useState({ name: "", category: "Konsultasi Akademik", message: "", contact: "" });
  const [stats, setStats] = useState({ aspirasiCount: 0, articlesCount: 0, resolvedCount: 0 });

  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [aspirasiHistory, setAspirasiHistory] = useState<any[]>([]);

  // Ticket Modal State
  const [ticketModal, setTicketModal] = useState<{ open: boolean; ticketId: string }>({ open: false, ticketId: "" });
  const [copied, setCopied] = useState(false);

  const WA_NUMBER = "6287827718245";

  useEffect(() => {
    fetch("/api/articles").then(r => r.json()).then(data => { setArticles(data); setLoadingArticles(false); }).catch(() => { setLoadingArticles(false); });
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => { });

    // Load Local History
    try {
      const historyStr = localStorage.getItem("sisakti_aspirasi_history");
      if (historyStr) setAspirasiHistory(JSON.parse(historyStr));
    } catch { }

    const handleOpenHistory = () => setIsHistoryOpen(true);
    window.addEventListener("openHistoryModal", handleOpenHistory);
    return () => window.removeEventListener("openHistoryModal", handleOpenHistory);
  }, []);

  const navItems = [
    { name: "Beranda", link: "/", icon: <IconHome className="h-4 w-4" /> },
    { name: "Tentang", link: "#tentang", icon: <IconInfoCircle className="h-4 w-4" /> },
    { name: "Panduan", link: "https://drive.google.com/file/d/1Vuz_nXFv9uaQkT0SFw6IgvfEnYmUYHiT/view?usp=sharing", icon: <IconBook className="h-4 w-4" /> },
    { name: "Kajian", link: "#ifyouknow", icon: <IconBooks className="h-4 w-4" /> },
    { name: "Riwayat", link: "#", icon: <IconHistory className="h-4 w-4" /> },
  ];

  const stat1 = useCountUp(stats.aspirasiCount);
  const stat2 = useCountUp(stats.articlesCount);
  const stat3 = useCountUp(stats.resolvedCount);

  const handleAspirasi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEntry = { ...formData, createdAt: new Date().toISOString() };
      const res = await fetch('/api/aspirasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const ticketId = data.ticketId || data.aspirasi?.id || "ASP-XXXXXX";
      const entryWithTicket = { ...newEntry, ticketId };

      const newHistory = [entryWithTicket, ...aspirasiHistory];
      setAspirasiHistory(newHistory);
      localStorage.setItem("sisakti_aspirasi_history", JSON.stringify(newHistory));

      setFormData({ name: "", category: "Konsultasi Akademik", message: "", contact: "" });
      setCopied(false);
      setTicketModal({ open: true, ticketId });
    } catch {
      alert("Gagal mengirim aspirasi, silakan coba lagi.");
    }
  };

  const copyTicket = () => {
    navigator.clipboard.writeText(ticketModal.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="bg-white dark:bg-brand-black min-h-screen selection:bg-brand-blue/20 selection:text-brand-blue font-sans overflow-x-hidden">
      <FloatingNav navItems={navItems} />

      {/* ═══ HERO ═══ */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden">
        {/* Lightweight BG — NO blur, CSS only */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-white dark:from-brand-black dark:via-neutral-950 dark:to-brand-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:32px_32px] animate-[drift_30s_linear_infinite]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-lightBlue/5 rounded-full -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-24 md:py-0">
          {/* Left */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
            <div className="px-4 py-2 rounded-full border border-brand-blue/20 bg-brand-blue/5 text-brand-blue text-xs md:text-sm tracking-widest uppercase font-semibold mb-8 flex items-center gap-2">
              <IconRobotFace className="w-4 h-4" /> Kajian Strategis & Advokasi
            </div>

            <TextGenerateEffect
              words="Suarakan Aspirasimu, Bersama SI SAKTI"
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
            />

            <p className="text-neutral-500 dark:text-neutral-400 text-base md:text-lg leading-relaxed max-w-lg mb-10">
              Platform advokasi resmi warga Teknik Informatika UIN Sunan Gunung Djati Bandung. Kami mendengar, mengkaji, dan memperjuangkan hak-hak mahasiswa secara transparan.
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <a href="#aspirasi" className="group px-8 py-4 rounded-full bg-brand-blue text-white font-semibold hover:bg-brand-darkBlue shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2">
                Kirim Aspirasi <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#tentang" className="px-8 py-4 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:border-brand-blue hover:text-brand-blue transition-all bg-white/50 dark:bg-neutral-900/50">
                Pelajari Lebih Lanjut
              </a>
              <a href="https://drive.google.com/file/d/1Vuz_nXFv9uaQkT0SFw6IgvfEnYmUYHiT/view?usp=sharing" target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full border border-brand-blue text-brand-blue font-medium hover:bg-brand-blue hover:text-white transition-all bg-transparent flex items-center gap-2">
                <IconBook className="w-5 h-5" /> Buku Panduan
              </a>
            </div>
          </div>

          {/* Right — Maskot */}
          <div className="flex justify-center order-1 md:order-2">
            <div className="relative w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] md:w-[480px] md:h-[480px] animate-float">
              <Image src="/maskot/utama.webp" fill alt="SI SAKTI" className="object-contain drop-shadow-[0_20px_60px_rgba(59,130,246,0.3)]" priority />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATISTICS ═══ */}
      <section className="relative bg-gradient-to-r from-brand-blue to-brand-darkBlue py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 grid grid-cols-3 gap-8 text-center text-white">
          {[
            { ref: stat1.ref, count: stat1.count, suffix: "+", label: "Aspirasi Tersampaikan" },
            { ref: stat2.ref, count: stat2.count, suffix: "+", label: "Kajian Dipublikasi" },
            { ref: stat3.ref, count: stat3.count, suffix: "", label: "Masalah Teratasi" },
          ].map((s, i) => (
            <div key={i} ref={s.ref} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold tracking-tight">{s.count}{s.suffix}</span>
              <span className="text-white/70 text-sm mt-2">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TENTANG SI SAKTI ═══ */}
      <section id="tentang" className="py-24 md:py-32 px-4 bg-white dark:bg-brand-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative flex justify-center">
            <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-brand-blue/5 rounded-full" />
            <div className="relative w-[280px] h-[380px] md:w-[380px] md:h-[480px] animate-float-slow">
              <Image src="/maskot/2.png" fill className="object-contain" alt="SI SAKTI" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/5 text-brand-blue border border-brand-blue/20 text-sm font-medium mb-6">
              <IconRobotFace className="w-4 h-4" /> Kenali SI SAKTI
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-6">
              Sahabat Advokasi <span className="text-brand-blue">Informatika</span>
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-base md:text-lg leading-relaxed mb-6">
              SI SAKTI adalah maskot sekaligus wajah program advokasi HIMATIF. Robot putih dengan aksen biru ini melambangkan keilmuan teknologi informasi — kejernihan, kepercayaan, dan semangat masa depan.
            </p>
            <p className="text-neutral-500 dark:text-neutral-400 text-base md:text-lg leading-relaxed mb-10">
              Di bawah naungan <strong className="text-neutral-900 dark:text-white">Bidang Kajian Strategis dan Advokasi (KASTRAD)</strong> HIMATIF UIN Sunan Gunung Djati Bandung, kami hadir sebagai jembatan transparan antara mahasiswa dan kampus.
            </p>

            <div className="grid grid-cols-2 gap-5">
              {[
                { icon: IconSpeakerphone, title: "Responsif", desc: "Cepat tanggap merespon aspirasi" },
                { icon: IconShieldCheck, title: "Solutif", desc: "Berorientasi pada penyelesaian" },
                { icon: IconHeartHandshake, title: "Transparan", desc: "Proses terbuka dan akuntabel" },
                { icon: IconSchool, title: "Edukatif", desc: "Literasi hak mahasiswa" },
              ].map((f, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-all">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">{f.title}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LAYANAN ADVOKASI ═══ */}
      <section id="layanan" className="py-24 md:py-32 px-4 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">Layanan Pengaduan</h2>
            <div className="w-16 h-1 bg-brand-blue mx-auto mb-6 rounded-full" />
            <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto text-base md:text-lg">Berbagai fokus penanganan isu yang kami advokasikan untuk kesejahteraan warga Informatika.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: IconBooks, title: "Akademik", desc: "Kendala KRS, nilai, dospem, atau kebijakan akademik yang dirasa kurang adil.", color: "from-blue-500 to-blue-600" },
              { icon: IconHome, title: "Fasilitas Kampus", desc: "Lapor kerusakan fasilitas, kekurangan lab, WiFi, atau prasarana belajar.", color: "from-sky-500 to-cyan-600" },
              { icon: IconGavel, title: "Layanan Administrasi", desc: "Bantuan birokrasi, regulasi kampus, beasiswa, dan kebebasan akademik.", color: "from-indigo-500 to-violet-600" },
              { icon: IconHeartHandshake, title: "Sosial & Keamanan", desc: "Pusat bantuan krisis: perundungan, pelecehan, atau konflik sosial kampus.", color: "from-purple-500 to-pink-600" },
            ].map((srv, i) => (
              <div key={i} className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 lg:p-8 hover:border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${srv.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 group-hover:bg-white/20 flex items-center justify-center mb-5 transition-colors">
                    <srv.icon className="w-6 h-6 text-brand-blue group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-white mb-3 transition-colors">{srv.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-white/80 leading-relaxed transition-colors">{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VIDEO MASKOT ═══ */}
      <section className="py-24 md:py-32 px-4 bg-white dark:bg-brand-black">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/5 text-brand-blue border border-brand-blue/20 text-sm font-medium mb-6">
            <IconRobotFace className="w-4 h-4" /> Perkenalkan
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">Hai, Aku SI SAKTI!</h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto mb-12 text-base md:text-lg">Robot advokasi yang siap menjadi sahabatmu dalam menyuarakan aspirasi di lingkungan kampus.</p>

          <div className="relative overflow-hidden bg-transparent max-w-3xl mx-auto">
            <video
              className="w-full h-auto max-h-[70vh] object-contain"
              autoPlay
              muted
              loop
              playsInline
              poster="/maskot/utama.webp"
            >
              <source src="/maskot/Video_Siap_Dibuat.mp4" type="video/mp4" />
            </video>
            <div className="mt-4 flex items-center justify-center gap-1.5 opacity-60">
              <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">Video generated by Veo 3 Google</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ IF YOU KNOW (DYNAMIC) ═══ */}
      <section id="ifyouknow" className="py-24 md:py-32 px-4 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">INFORMA</h2>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl text-base md:text-lg">Program wadah penyampaian informasi mengenai isu-isu viral dan tema strategis terkini, dikaji dari kacamata Informatika.</p>
            </div>
            <a href="https://medium.com/@kastrad.himatifuinsgd" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-blue font-semibold hover:underline shrink-0 text-sm">
              Lihat semua di Medium <IconBrandMedium className="w-5 h-5" />
            </a>
          </div>

          {loadingArticles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 animate-pulse">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 mb-4" />
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-full mb-3" />
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3 mb-6" />
                  <div className="h-[200px] bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-white/40 dark:bg-neutral-900/40 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm">
              <div className="relative w-28 h-28 mb-5 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                <Image src="/maskot/3.png" fill alt="Coming Soon" className="object-contain" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-300 mb-2">Belum Ada Kajian</h3>
              <p className="text-neutral-500 dark:text-neutral-500 text-center max-w-sm text-sm">
                Bidang KASTRAD HIMATIF sedang menyiapkan kajian strategis terbaru untuk diterbitkan. Nantikan segera!
              </p>
              <div className="mt-6 px-5 py-2 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 text-[10px] font-bold uppercase tracking-widest">
                Coming Soon
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles.map((art) => (
                <div key={art.id} className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 hover:border-brand-blue/40 hover:shadow-lg transition-all flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-3">{art.badge}</span>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2 leading-tight">{art.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5 line-clamp-3 leading-relaxed flex-1">{art.description}</p>
                  <div className="relative h-[180px] rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-slate-50 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center mb-5 border border-neutral-100 dark:border-neutral-800">
                    {art.maskotImage ? (
                      <img src={art.maskotImage} alt={art.title} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md" />
                    ) : (
                      <span className="text-neutral-400 text-xs">Tidak ada gambar</span>
                    )}
                  </div>
                  <a href={art.link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-brand-blue hover:text-white transition-all text-sm font-semibold">
                    Baca Selengkapnya <IconExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ GALLERY MASKOT ═══ */}
      <section className="py-24 md:py-32 bg-white dark:bg-brand-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">Ekspresi SI SAKTI</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-base md:text-lg">Berbagai pose si robot advokasi favoritmu!</p>
          </div>
          <MaskotGallery />
        </div>
      </section>

      {/* ═══ FORM ASPIRASI ═══ */}
      <section id="aspirasi" className="py-24 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-brand-darkBlue to-indigo-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-16 items-center">
          {/* Left info */}
          <div className="md:col-span-2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">Punya Keluhan<br />atau Aspirasi?</h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-10">Jangan ragu menyuarakan kendala. SI SAKTI siap mendengarkan dan menindaklanjuti — aman, rahasia, terpercaya.</p>
            <div className="hidden md:block relative w-[240px] h-[240px] mx-auto md:mx-0 animate-float">
              <Image src="/maskot/5.png" fill alt="SI SAKTI Ready" className="object-contain drop-shadow-2xl" />
            </div>
          </div>

          {/* Right form */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-neutral-900 p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                <IconMessage className="w-5 h-5 text-brand-blue" /> Form Pengaduan Online
              </h3>
              <form onSubmit={handleAspirasi} className="flex flex-col gap-5">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Nama / NIM (Boleh anonim)</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-sm" placeholder="Contoh: Hamba Allah / 12340500XX" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-sm">
                    <option value="Konsultasi Akademik">Akademik (Nilai, KRS, Dosen)</option>
                    <option value="Fasilitas Kampus">Fasilitas & Layanan Kampus</option>
                    <option value="Administrasi Kampus">Birokrasi & Administrasi Kampus</option>
                    <option value="Keresahan Sosial">Keresahan Sosial / Kekerasan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Deskripsi Kendala</label>
                  <textarea rows={4} required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all resize-none text-sm" placeholder="Ceritakan kendala yang sedang kamu alami..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Kontak untuk Tindak Lanjut <span className="text-neutral-400 font-normal">(opsional)</span></label>
                  <input type="text" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-sm" placeholder="No. WA / Email / ID Line (agar KASTRAD bisa menghubungi)" />
                </div>
                <button type="submit" disabled={!formData.message} className="w-full py-4 rounded-xl bg-brand-blue hover:bg-brand-darkBlue text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-blue/25 transition-all text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  Kirim ke SI SAKTI
                </button>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center flex items-center justify-center gap-1 mt-1">
                  Atau hubungi KASTRAD via WA: <span className="text-brand-blue font-semibold">{WA_NUMBER.replace('62', '0')}</span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-white dark:bg-neutral-950 pt-16 pb-8 border-t border-neutral-200 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-10 mb-12">
          <div className="flex flex-col items-center md:items-start max-w-sm">
            <div className="flex items-center gap-3 mb-6 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <Image src="/logo/uin.png" width={40} height={40} alt="UIN" className="object-contain" />
              <Image src="/logo/himatif.png" width={40} height={40} alt="HIMATIF" className="object-contain" />
              <Image src="/logo/palanata.png" width={50} height={50} alt="Palanata" className="object-contain" />
              <Image src="/logo/kastrad.png" width={40} height={40} alt="KASTRAD" className="object-contain" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">KASTRAD HIMATIF</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 text-center md:text-left leading-relaxed">
              Kajian Strategis & Advokasi — HIMATIF UIN Sunan Gunung Djati Bandung. Kabinet Palanata 2025/2026.
            </p>
          </div>

          <div className="flex flex-col text-center md:text-right gap-3 text-sm">
            <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Tautan</h4>
            <a href="https://drive.google.com/file/d/1Vuz_nXFv9uaQkT0SFw6IgvfEnYmUYHiT/view?usp=sharing" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-brand-blue transition-colors">Buku Panduan</a>
            <a href="https://www.instagram.com/himatifuinbandung" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-brand-blue transition-colors">Instagram HIMATIF</a>
            <a href="https://medium.com/@kastrad.himatifuinsgd" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-brand-blue transition-colors">Medium INFORMA</a>
            <a href="/admin" className="text-neutral-500 hover:text-brand-blue transition-colors">Admin Panel</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-neutral-200 dark:border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} KASTRAD HIMATIF UIN SGD Bandung</p>
          <p className="text-brand-blue font-medium">Powered by SI SAKTI</p>
        </div>
      </footer>

      {/* ═══ MODAL RIWAYAT ASPIRASI ═══ */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity" onClick={() => setIsHistoryOpen(false)}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <IconHistory className="w-5 h-5 text-brand-blue" />
                </div>
                Riwayat Advokasi Saya
              </h3>
              <button onClick={() => setIsHistoryOpen(false)} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <IconX className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 dark:bg-neutral-950/50">
              {aspirasiHistory.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 flex items-center justify-center ring-4 ring-neutral-50 dark:ring-neutral-950">
                    <IconInbox className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-neutral-800 dark:text-neutral-200">Belum ada riwayat advokasi</h4>
                    <p className="text-sm text-neutral-500 mt-1.5 max-w-sm mx-auto leading-relaxed">Pengaduan dan aspirasi yang Anda kirim dari perangkat ini akan muncul di sini.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {aspirasiHistory.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-brand-blue/30 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
                        <span className="text-xs font-medium text-neutral-500">{new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {item.ticketId && (
                        <div className="flex items-center gap-2 mb-3 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                          <IconTicket className="w-4 h-4 text-brand-blue shrink-0" />
                          <span className="font-mono font-bold text-sm text-brand-blue tracking-wider">{item.ticketId}</span>
                          <Link href={`/tracking?ticket=${item.ticketId}`} className="ml-auto text-[10px] font-semibold text-brand-blue hover:underline shrink-0 flex items-center gap-1">
                            Lacak Status →
                          </Link>
                        </div>
                      )}
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                      <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                          <IconUser className="w-3.5 h-3.5 text-neutral-500" />
                        </div>
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{item.name || "Anonim"}</span>
                        <span className="ml-auto flex items-center gap-1 text-[10px] text-green-600 dark:text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full font-bold border border-green-500/20 shrink-0">
                          Terkirim <span className="hidden sm:inline">ke Sistem</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL TIKET BERHASIL ═══ */}
      {ticketModal.open && (
        <div className="fixed inset-0 z-[7000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setTicketModal({ open: false, ticketId: "" })}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <Image src="/maskot/6.webp" fill alt="Berhasil" className="object-contain drop-shadow-lg" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Aspirasi Berhasil Dikirim! 🎉</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                Aspirasi Anda telah tercatat di sistem SI SAKTI. Simpan kode tiket berikut untuk melacak tindak lanjut:
              </p>
              <div className="bg-neutral-50 dark:bg-neutral-950 border-2 border-dashed border-brand-blue/40 rounded-2xl p-5 mb-4">
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-2">Kode Tiket Anda</p>
                <p className="text-3xl font-black font-mono text-brand-blue tracking-[0.2em]">{ticketModal.ticketId}</p>
              </div>
              <button onClick={copyTicket} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mb-3 ${copied ? 'bg-green-500 text-white' : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/30 hover:bg-brand-blue hover:text-white'}`}>
                {copied ? <><IconCheck className="w-4 h-4" /> Tersalin!</> : <><IconCopy className="w-4 h-4" /> Salin Kode Tiket</>}
              </button>
              <Link href={`/tracking?ticket=${ticketModal.ticketId}`} className="block w-full py-3 rounded-xl bg-brand-blue text-white font-bold text-sm text-center hover:bg-brand-darkBlue transition-all shadow-lg mb-4">
                Lacak Status Tiket →
              </Link>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                ⚠️ <strong>Penting:</strong> Simpan kode tiket ini! Anda juga bisa melihatnya di menu <strong>Riwayat</strong> di navbar atas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Bubble */}
      <ChatBubble />
    </main>
  );
}
