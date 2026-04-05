"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconShieldCheck, IconUser, IconMessageCircle, IconRefresh, IconLogout,
  IconCategory, IconArticle, IconPlus, IconEdit, IconTrash, IconX, IconCheck,
  IconPhoto, IconMessage2, IconStar, IconStarFilled, IconChevronDown, IconChevronUp,
  IconFileReport, IconDownload
} from "@tabler/icons-react";

interface Aspirasi { id: string; name: string; category: string; message: string; status: string; tindakLanjut: string; createdAt: string; }
interface Article { id: string; title: string; badge: string; description: string; link: string; maskotImage: string; createdAt: string; }
interface ChatLog { id: string; messages: { role: string; content: string }[]; status: string; totalMessages: number; createdAt: string; resolvedAt: string | null; }
interface Feedback { id: string; name: string; rating: number; message: string; createdAt: string; }

const MASKOT_OPTIONS = ["/maskot/1.png", "/maskot/2.png", "/maskot/3.png", "/maskot/4.png", "/maskot/5.png", "/maskot/6.png"];

export default function AdminPage() {
  const [tab, setTab] = useState<"aspirasi" | "artikel" | "chatlog" | "feedback">("aspirasi");
  const [aspirasi, setAspirasi] = useState<Aspirasi[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [chatlogs, setChatLogs] = useState<ChatLog[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const router = useRouter();

  // Article Modal
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleForm, setArticleForm] = useState({ title: "", badge: "", description: "", link: "https://medium.com/@kastradhimatif", maskotImage: "/maskot/1.png" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Chat log expand
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Aspirasi follow-up editing
  const [editingAspirasi, setEditingAspirasi] = useState<string | null>(null);
  const [aspirasiEditForm, setAspirasiEditForm] = useState({ status: "Menunggu", tindakLanjut: "" });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aspRes, artRes, logRes, fbRes] = await Promise.all([
        fetch('/api/aspirasi'), fetch('/api/articles'), fetch('/api/chatlogs'), fetch('/api/feedback')
      ]);
      if (aspRes.ok) setAspirasi(await aspRes.json());
      if (artRes.ok) setArticles(await artRes.json());
      if (logRes.ok) setChatLogs(await logRes.json());
      if (fbRes.ok) setFeedbacks(await fbRes.json());
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const openAddArticle = () => { setEditingArticle(null); setArticleForm({ title: "", badge: "", description: "", link: "https://medium.com/@kastradhimatif", maskotImage: "/maskot/1.png" }); setShowModal(true); };
  const openEditArticle = (art: Article) => { setEditingArticle(art); setArticleForm({ title: art.title, badge: art.badge, description: art.description, link: art.link, maskotImage: art.maskotImage }); setShowModal(true); };

  const handleSaveArticle = async () => {
    setSaving(true);
    try {
      if (editingArticle) {
        await fetch('/api/articles', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingArticle.id, ...articleForm }) });
      } else {
        await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(articleForm) });
      }
      await fetchAll(); setShowModal(false);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDeleteArticle = async (id: string) => {
    await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
    await fetchAll(); setDeleteConfirm(null);
  };

  const handleUpdateAspirasi = async (id: string) => {
    try {
      await fetch('/api/aspirasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: aspirasiEditForm.status, tindak_lanjut: aspirasiEditForm.tindakLanjut })
      });
      setEditingAspirasi(null);
      await fetchAll();
    } catch (e) { console.error(e); }
  };

  const exportAspirasiCSV = () => {
    const BOM = "\uFEFF";
    const header = "Kode_Tiket,Tanggal,Nama/NIM,Kategori,Status,Pesan,Tindak_Lanjut\n";
    const rows = aspirasi.map(a => {
      const cleanMessage = a.message.replace(/[\n\r]+/g, ' ').replace(/"/g, '""');
      const cleanTL = (a.tindakLanjut || '').replace(/[\n\r]+/g, ' ').replace(/"/g, '""');
      return `"${a.id}","${new Date(a.createdAt).toLocaleString('id-ID')}","${a.name}","${a.category}","${a.status || 'Menunggu'}","${cleanMessage}","${cleanTL}"`;
    }).join("\n");
    const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Aspirasi_KASTRAD_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportChatlogsCSV = () => {
    const BOM = "\uFEFF";
    const header = "ID_Chat,Tanggal,Status,Total_Pesan,Detail_Percakapan\n";
    const rows = chatlogs.map(c => {
      const msgStr = c.messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join(" | ");
      const cleanMsgStr = msgStr.replace(/[\n\r]+/g, ' ').replace(/"/g, '""');
      return `"${c.id}","${new Date(c.createdAt).toLocaleString('id-ID')}","${c.status}","${c.totalMessages}","${cleanMsgStr}"`;
    }).join("\n");
    const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_AI_Chatbot_KASTRAD_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportFeedbackCSV = () => {
    const BOM = "\uFEFF";
    const header = "ID,Tanggal,Nama,Rating,Komentar\n";
    const rows = feedbacks.map(f => {
      const cleanMessage = f.message.replace(/[\n\r]+/g, ' ').replace(/"/g, '""');
      return `"${f.id}","${new Date(f.createdAt).toLocaleString('id-ID')}","${f.name}","${f.rating} Bintang","${cleanMessage}"`;
    }).join("\n");
    const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Feedback_KASTRAD_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Hitung rata-rata rating
  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : "0";
  const resolvedLogs = chatlogs.filter(l => l.status === "resolved").length;

  useEffect(() => { fetchAll(); const iv = setInterval(fetchAll, 20000); return () => clearInterval(iv); }, []);

  const tabs = [
    { id: "aspirasi" as const, label: "Aspirasi", icon: IconMessageCircle, count: aspirasi.length },
    { id: "artikel" as const, label: "Artikel", icon: IconArticle, count: articles.length },
    { id: "chatlog" as const, label: "Log Chat AI", icon: IconMessage2, count: chatlogs.length },
    { id: "feedback" as const, label: "Feedback", icon: IconStar, count: feedbacks.length },
  ];

  return (
    <div className="min-h-screen bg-brand-black text-white p-4 md:p-8 lg:p-12 font-sans pt-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">Dashboard <span className="text-brand-blue">KASTRAD</span></h1>
            <p className="text-neutral-500 mt-1 text-sm">Pusat pengelolaan data advokasi — bahan LPJ SI SAKTI.</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <button onClick={exportAspirasiCSV} disabled={aspirasi.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue/10 border border-brand-blue/30 hover:bg-brand-blue hover:text-white text-brand-blue rounded-xl transition-all text-xs font-semibold disabled:opacity-50">
              <IconFileReport className="w-4 h-4" /> <span className="hidden lg:inline">CSV Aspirasi</span>
            </button>
            <button onClick={exportChatlogsCSV} disabled={chatlogs.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue/10 border border-brand-blue/30 hover:bg-brand-blue hover:text-white text-brand-blue rounded-xl transition-all text-xs font-semibold disabled:opacity-50">
              <IconDownload className="w-4 h-4" /> <span className="hidden lg:inline">CSV Chatbot AI</span>
            </button>
            <button onClick={exportFeedbackCSV} disabled={feedbacks.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue/10 border border-brand-blue/30 hover:bg-brand-blue hover:text-white text-brand-blue rounded-xl transition-all text-xs font-semibold disabled:opacity-50">
              <IconStar className="w-4 h-4" /> <span className="hidden lg:inline">CSV Feedback</span>
            </button>
            <button onClick={fetchAll} disabled={loading} className="flex items-center gap-2 px-3 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-brand-blue rounded-xl transition-all text-sm font-medium disabled:opacity-50 ml-auto md:ml-4">
              <IconRefresh className={`w-4 h-4 text-brand-blue ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-all text-sm font-medium text-red-400">
              <IconLogout className="w-4 h-4" /> <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Total Aspirasi</p>
            <p className="text-2xl font-bold text-white">{aspirasi.length}</p>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Chat Diselesaikan</p>
            <p className="text-2xl font-bold text-green-400">{resolvedLogs}<span className="text-sm text-neutral-500 font-normal">/{chatlogs.length}</span></p>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Rata-rata Rating</p>
            <p className="text-2xl font-bold text-yellow-400">⭐ {avgRating}</p>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Total Feedback</p>
            <p className="text-2xl font-bold text-brand-blue">{feedbacks.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-neutral-900 p-1 rounded-xl overflow-x-auto scroll-hide border border-neutral-800">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${tab === t.id ? "bg-brand-blue text-white shadow-lg" : "text-neutral-400 hover:text-white"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label} <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab === t.id ? "bg-white/20" : "bg-neutral-800"}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ═══ TAB: ASPIRASI ═══ */}
        {tab === "aspirasi" && (
          aspirasi.length === 0 && !loading ? (
            <EmptyState icon={IconShieldCheck} title="Belum ada aspirasi" desc="Data dari formulir website akan muncul otomatis." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {aspirasi.map(item => (
                <div key={item.id} className="bg-neutral-900/60 border border-neutral-800 hover:border-brand-blue/40 p-5 rounded-2xl transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-neutral-800 rounded-full flex items-center justify-center group-hover:bg-brand-blue/20 transition-colors shrink-0">
                        <IconUser className="w-4 h-4 text-brand-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                        <p className="text-[10px] text-neutral-500">{new Date(item.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold border ${
                        item.status === 'Selesai' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                        item.status === 'Diproses' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                        'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>{item.status || 'Menunggu'}</span>
                      <span className="px-2 py-0.5 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] rounded-full font-mono font-semibold">{item.id}</span>
                    </div>
                  </div>
                  <div className="bg-neutral-800/50 px-3 py-1.5 rounded-lg mb-2 inline-block">
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1"><IconCategory className="w-3 h-3" /> {item.category}</span>
                  </div>
                  <div className="bg-neutral-950/50 border border-neutral-800 p-3.5 rounded-xl mb-3">
                    <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                  </div>
                  {item.tindakLanjut && (
                    <div className="bg-brand-blue/5 border border-brand-blue/20 p-3 rounded-xl mb-3">
                      <p className="text-[10px] text-brand-blue font-bold uppercase tracking-wider mb-1">Tindak Lanjut:</p>
                      <p className="text-xs text-neutral-300 whitespace-pre-wrap">{item.tindakLanjut}</p>
                    </div>
                  )}
                  {editingAspirasi === item.id ? (
                    <div className="bg-neutral-800/80 border border-neutral-700 p-4 rounded-xl space-y-3">
                      <select value={aspirasiEditForm.status} onChange={e => setAspirasiEditForm({...aspirasiEditForm, status: e.target.value})} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white">
                        <option value="Menunggu">⏳ Menunggu</option>
                        <option value="Diproses">🔄 Diproses</option>
                        <option value="Selesai">✅ Selesai</option>
                      </select>
                      <textarea value={aspirasiEditForm.tindakLanjut} onChange={e => setAspirasiEditForm({...aspirasiEditForm, tindakLanjut: e.target.value})} placeholder="Tulis catatan tindak lanjut untuk mahasiswa..." className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white resize-none" rows={3} />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateAspirasi(item.id)} className="flex-1 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg hover:bg-brand-darkBlue transition-all">Simpan</button>
                        <button onClick={() => setEditingAspirasi(null)} className="px-4 py-2 bg-neutral-700 text-neutral-300 text-xs font-bold rounded-lg hover:bg-neutral-600 transition-all">Batal</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingAspirasi(item.id); setAspirasiEditForm({ status: item.status || 'Menunggu', tindakLanjut: item.tindakLanjut || '' }); }} className="w-full py-2.5 bg-neutral-800 hover:bg-brand-blue/20 border border-neutral-700 hover:border-brand-blue/30 rounded-xl text-xs font-semibold text-neutral-400 hover:text-brand-blue transition-all flex items-center justify-center gap-2">
                      <IconEdit className="w-3.5 h-3.5" /> Tindak Lanjuti
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ═══ TAB: ARTIKEL ═══ */}
        {tab === "artikel" && (
          <>
            <div className="mb-4">
              <button onClick={openAddArticle} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-brand-darkBlue text-white rounded-xl font-semibold text-xs transition-all shadow-lg">
                <IconPlus className="w-4 h-4" /> Tambah Artikel
              </button>
            </div>
            {articles.length === 0 ? (
              <EmptyState icon={IconArticle} title="Belum ada artikel" desc="Tekan tombol di atas untuk menambahkan." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {articles.map(art => (
                  <div key={art.id} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 flex flex-col hover:border-brand-blue/40 transition-all">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue mb-2">{art.badge}</span>
                    <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-2 leading-snug">{art.title}</h3>
                    <p className="text-xs text-neutral-500 mb-3 line-clamp-2 flex-1">{art.description}</p>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => openEditArticle(art)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-neutral-800 hover:bg-brand-blue text-neutral-400 hover:text-white transition-all text-[11px] font-medium"><IconEdit className="w-3 h-3" /> Edit</button>
                      {deleteConfirm === art.id ? (
                        <div className="flex-1 flex gap-1">
                          <button onClick={() => handleDeleteArticle(art.id)} className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[11px]"><IconCheck className="w-3 h-3" /></button>
                          <button onClick={() => setDeleteConfirm(null)} className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-all text-[11px]"><IconX className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(art.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-all text-[11px] font-medium"><IconTrash className="w-3 h-3" /> Hapus</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ TAB: LOG CHAT AI ═══ */}
        {tab === "chatlog" && (
          chatlogs.length === 0 && !loading ? (
            <EmptyState icon={IconMessage2} title="Belum ada log chat" desc="Percakapan AI yang ditandai 'Teratasi' akan muncul di sini." />
          ) : (
            <div className="flex flex-col gap-3">
              {chatlogs.map(log => (
                <div key={log.id} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden hover:border-brand-blue/30 transition-all">
                  {/* Log Header — clickable */}
                  <button onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${log.status === 'resolved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {log.status === 'resolved' ? <IconCheck className="w-4 h-4" /> : <IconMessage2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.status === 'resolved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                            {log.status === 'resolved' ? '✅ Teratasi' : '⏳ Belum'}
                          </span>
                          <span className="text-[10px] text-neutral-600">{log.id}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">{new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} — {log.totalMessages} pesan</p>
                      </div>
                    </div>
                    {expandedLog === log.id ? <IconChevronUp className="w-4 h-4 text-neutral-500" /> : <IconChevronDown className="w-4 h-4 text-neutral-500" />}
                  </button>

                  {/* Expanded Chat Log */}
                  {expandedLog === log.id && (
                    <div className="border-t border-neutral-800 px-4 py-4 bg-black/30 max-h-[400px] overflow-y-auto space-y-3">
                      {log.messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user' ? 'bg-brand-blue/20 text-brand-lightBlue rounded-br-sm' : 'bg-neutral-800 text-neutral-300 rounded-bl-sm'
                          }`}>
                            <span className="text-[9px] font-semibold block mb-1 opacity-50">{msg.role === 'user' ? 'MAHASISWA' : 'SI SAKTI AI'}</span>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ═══ TAB: FEEDBACK ═══ */}
        {tab === "feedback" && (
          feedbacks.length === 0 && !loading ? (
            <EmptyState icon={IconStar} title="Belum ada feedback" desc="Feedback dari halaman /feedback akan muncul di sini." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedbacks.map(fb => (
                <div key={fb.id} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 hover:border-brand-blue/40 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{fb.name}</h3>
                      <p className="text-[10px] text-neutral-500">{new Date(fb.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    <span className="text-[10px] text-neutral-600">{fb.id}</span>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      s <= fb.rating ? <IconStarFilled key={s} className="w-4 h-4 text-yellow-400" /> : <IconStar key={s} className="w-4 h-4 text-neutral-700" />
                    ))}
                  </div>
                  {fb.message && (
                    <p className="text-xs text-neutral-400 leading-relaxed bg-neutral-950/50 border border-neutral-800 p-3 rounded-xl">{fb.message}</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ═══ MODAL: ADD/EDIT ARTICLE ═══ */}
        {showModal && (
          <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-white">{editingArticle ? "Edit Artikel" : "Tambah Artikel Baru"}</h3>
                <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"><IconX className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 mb-1 block">Judul Artikel</label>
                  <input type="text" value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-blue transition-all" placeholder="Judul kajian..." />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 mb-1 block">Badge / Kategori</label>
                  <input type="text" value={articleForm.badge} onChange={e => setArticleForm({ ...articleForm, badge: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-blue transition-all" placeholder="Contoh: Kajian Teknologi" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 mb-1 block">Deskripsi</label>
                  <textarea rows={3} value={articleForm.description} onChange={e => setArticleForm({ ...articleForm, description: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-blue transition-all resize-none" placeholder="Ringkasan isi kajian..." />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 mb-1 block">Link Medium</label>
                  <input type="url" value={articleForm.link} onChange={e => setArticleForm({ ...articleForm, link: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-blue transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block"><IconPhoto className="w-3 h-3 inline mr-1" />Pilih Maskot</label>
                  <div className="grid grid-cols-6 gap-2">
                    {MASKOT_OPTIONS.map((m, i) => (
                      <button key={i} type="button" onClick={() => setArticleForm({ ...articleForm, maskotImage: m })} className={`aspect-square rounded-xl border-2 flex items-center justify-center p-1 transition-all ${articleForm.maskotImage === m ? "border-brand-blue bg-brand-blue/10" : "border-neutral-800 hover:border-neutral-600"}`}>
                        <img src={m} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleSaveArticle} disabled={saving || !articleForm.title || !articleForm.badge} className="mt-1 w-full py-2.5 rounded-xl bg-brand-blue hover:bg-brand-darkBlue text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? "Menyimpan..." : <><IconCheck className="w-4 h-4" /> {editingArticle ? "Simpan" : "Publikasikan"}</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-14 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
      <Icon className="w-12 h-12 text-neutral-700 mb-3" />
      <h3 className="text-base font-medium text-neutral-500">{title}</h3>
      <p className="text-neutral-600 text-xs mt-1">{desc}</p>
    </div>
  );
}
