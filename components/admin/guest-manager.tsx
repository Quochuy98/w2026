"use client";

import { useEffect, useState, useTransition } from "react";
import { type EventType, type GuestInfo } from "@/content/wedding";
import { ALL_NATURE_CODES, getRandomNatureCode } from "@/lib/nature-codes";
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Trash,
  ArrowSquareOut,
  Sparkle,
  Buildings,
  House,
  Eye,
  MagnifyingGlass,
  ArrowClockwise,
  PencilSimple,
  FloppyDisk,
  X,
} from "@phosphor-icons/react";

export function GuestManager() {
  const [guests, setGuests] = useState<GuestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [name, setName] = useState("");
  const [salutation, setSalutation] = useState("Bạn");
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [side, setSide] = useState<"groom" | "bride">("groom");
  const [customCode, setCustomCode] = useState("");
  const [note, setNote] = useState("");

  // Edit Modal State
  const [editingGuest, setEditingGuest] = useState<GuestInfo | null>(null);
  const [editName, setEditName] = useState("");
  const [editSalutation, setEditSalutation] = useState("Bạn");
  const [editEventType, setEditEventType] = useState<EventType>("wedding");
  const [editSide, setEditSide] = useState<"groom" | "bride">("groom");
  const [editNote, setEditNote] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditModal = (guest: GuestInfo) => {
    setEditingGuest(guest);
    setEditName(guest.name);
    setEditSalutation(guest.salutation || "Bạn");
    setEditEventType(guest.eventType || "wedding");
    setEditSide(guest.side || "groom");
    setEditNote(guest.note || "");
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingGuest(null);
    setEditError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest || !editName.trim()) return;

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const res = await fetch("/api/guests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: editingGuest.code,
          name: editName.trim(),
          salutation: editSalutation,
          eventType: editEventType,
          side: editSide,
          note: editNote.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.guest) {
        setNotice(`Đã cập nhật thông tin khách mời "${editSalutation} ${editName}" (Mã: ${editingGuest.code})`);
        setGuests((prev) => prev.map((item) => (item.code === data.guest.code ? data.guest : item)));
        setEditingGuest(null);
      } else {
        setEditError(data.error || "Không thể cập nhật thông tin khách mời.");
      }
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Lỗi hệ thống");
    } finally {
      setIsSavingEdit(false);
    }
  };


  const handleRandomizeCode = () => {
    const existingCodes = new Set(guests.map((g) => g.code.toLowerCase()));
    const unusedCodes = ALL_NATURE_CODES.filter((c) => !existingCodes.has(c.toLowerCase()));
    if (unusedCodes.length > 0) {
      const randomIndex = Math.floor(Math.random() * unusedCodes.length);
      setCustomCode(unusedCodes[randomIndex]);
    } else {
      setCustomCode(getRandomNatureCode(true));
    }
  };


  const refreshGuests = async () => {
    try {
      const res = await fetch("/api/guests", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setGuests(data.guests || []);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/guests", { cache: "no-store" });
        if (res.ok && !ignore) {
          const data = await res.json();
          setGuests(data.guests || []);
        }
      } catch {
        // Error handling
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, []);


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setNotice(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            salutation,
            eventType,
            side,
            code: customCode.trim() || undefined,
            note: note.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (res.ok && data.guest) {
          setNotice(`Đã tạo thiệp mời thành công cho "${salutation} ${name}" (Mã: ${data.guest.code})`);
          setName("");
          setCustomCode("");
          setNote("");
          await refreshGuests();
        } else {
          setNotice(data.error || "Không thể tạo thiệp mời.");
        }
      } catch (err) {
        setNotice(err instanceof Error ? err.message : "Lỗi hệ thống");
      }
    });
  };

  const handleDelete = async (code: string, guestName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thiệp của "${guestName}"?`)) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/guests?code=${encodeURIComponent(code)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setNotice(`Đã xóa khách mời "${guestName}".`);
          await refreshGuests();
        }
      } catch {
        setNotice("Không thể xóa khách mời.");
      }
    });
  };

  const handleCopyLink = async (code: string) => {
    const origin = window.location.origin;
    const url = `${origin}/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // Fallback
    }
  };

  const filteredGuests = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.code.toLowerCase().includes(search.toLowerCase()) ||
      g.salutation.toLowerCase().includes(search.toLowerCase())
  );

  const trimmedCustomCode = customCode.trim().toLowerCase();
  const duplicateGuest = trimmedCustomCode
    ? guests.find((g) => g.code.toLowerCase() === trimmedCustomCode)
    : null;
  const isCustomCodeDuplicate = Boolean(duplicateGuest);

  return (
    <div className="mt-8 space-y-12">
      {notice && (
        <div role="status" className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--surface)] p-4 text-sm text-[var(--foreground)]">
          {notice}
        </div>
      )}

      {/* Form Tạo Khách Mới */}
      <section aria-labelledby="add-guest-title" className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6 text-[var(--accent)]">
          <UserPlus size={24} weight="duotone" />
          <h2 id="add-guest-title" className="font-display text-2xl sm:text-3xl text-[var(--foreground)] tracking-[-0.03em]">
            Tạo Mã Khách Mời Mới
          </h2>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-2">
                Danh Xưng
              </label>
              <select
                value={salutation}
                onChange={(e) => setSalutation(e.target.value)}
                className="w-full min-h-11 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
              >
                <option value="Bạn">Bạn</option>
                <option value="Anh">Anh</option>
                <option value="Chị">Chị</option>
                <option value="Em">Em</option>
                <option value="Cô">Cô</option>
                <option value="Chú">Chú</option>
                <option value="Bác">Bác</option>
                <option value="Cô Chú">Cô Chú</option>
                <option value="Vợ Chồng">Vợ Chồng</option>
                <option value="Gia đình">Gia đình</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-2">
                Tên Khách Mời *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nam & Bạn Gái, Tuấn..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-11 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-2">
                Sự Kiện Mời *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full min-h-11 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
              >
                <option value="wedding">Lễ Cưới (Tư gia Vĩnh Long)</option>
                <option value="reception">Tiệc Báo Hỷ (Unique Quận 7)</option>
                <option value="both">Cả 2 Sự Kiện (Lễ Cưới &amp; Báo Hỷ)</option>
              </select>

            </div>


            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-2">
                Khách Bên Nào
              </label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as "groom" | "bride")}
                className="w-full min-h-11 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
              >
                <option value="groom">Nhà Trai (Quốc Huy)</option>
                <option value="bride">Nhà Gái (Hoài Thương)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">
                  Mã Mời Tùy Chọn
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeCode}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <Sparkle size={13} className="text-[var(--accent)]" />
                  <span>Random mã mới</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="VD: rose, swan, koi, bamboo..."
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className={`w-full min-h-11 rounded-xl border ${
                    isCustomCodeDuplicate
                      ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-[var(--line)]"
                  } bg-[var(--background)] pl-3 pr-24 text-sm text-[var(--foreground)]`}
                />
                <button
                  type="button"
                  onClick={handleRandomizeCode}
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--line)] text-xs font-medium text-[var(--foreground)] border border-[var(--line)] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Tạo ngẫu nhiên tên loài hoa, chim, cá, cây bằng tiếng Anh (chưa dùng)"
                >
                  <span>🎲</span>
                  <span>Random</span>
                </button>
              </div>
              {isCustomCodeDuplicate ? (
                <p className="mt-1.5 text-[11px] font-medium text-rose-500 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>
                    Mã &quot;{trimmedCustomCode}&quot; đã được dùng cho khách &quot;{duplicateGuest?.salutation} {duplicateGuest?.name}&quot;. Vui lòng đổi mã khác.
                  </span>
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                  Để trống hệ thống sẽ tự động gán tên tiếng Anh của một loài hoa, chim, cá hoặc cây ngẫu nhiên (VD: rose, swan, koi, pine...).
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-2">
                Ghi Chú Nội Bộ (Không bắt buộc)
              </label>
              <input
                type="text"
                placeholder="VD: Bạn thân đại học, Bàn 03..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full min-h-11 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !name.trim() || isCustomCodeDuplicate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-contrast)] transition hover:bg-[var(--accent-strong)] disabled:opacity-40"
          >
            <Sparkle size={16} weight="fill" />
            <span>{isPending ? "Đang tạo..." : "Tạo link thiệp mời"}</span>
          </button>
        </form>
      </section>

      {/* Danh Sách Khách Mời */}
      <section aria-labelledby="guest-list-title" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <Users size={24} weight="duotone" />
              <h2 id="guest-list-title" className="font-display text-3xl text-[var(--foreground)] tracking-[-0.04em]">
                Danh Sách Khách Mời ({guests.length})
              </h2>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Quản lý danh sách thiệp, copy link 1-click gửi qua Zalo / Messenger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-h-10 pl-9 pr-4 rounded-full border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <button
              type="button"
              onClick={refreshGuests}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[var(--line)] px-3 text-xs font-semibold transition hover:border-[var(--accent)]"
              title="Làm mới danh sách"
            >
              <ArrowClockwise size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>


        {loading ? (
          <div className="rounded-2xl border border-[var(--line)] p-12 text-center text-sm text-[var(--muted)]">
            Đang tải dữ liệu khách mời...
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] p-12 text-center text-sm text-[var(--muted)]">
            Chưa có khách mời nào. Hãy tạo khách mời đầu tiên ở phía trên.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)]/50 backdrop-blur-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-strong)]/60 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">
                  <th className="p-4">Khách Mời</th>
                  <th className="p-4">Mã Link</th>
                  <th className="p-4">Sự Kiện</th>
                  <th className="p-4">Bên</th>
                  <th className="p-4 text-center">Lượt Xem</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredGuests.map((g) => {
                  const isCopied = copiedCode === g.code;
                  return (
                    <tr key={g.code} className="hover:bg-[var(--surface)]/80 transition-colors">
                      <td className="p-4 font-medium text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--muted)]">{g.salutation}</span>
                          <span className="font-semibold text-base">{g.name}</span>
                        </div>
                        {g.note && <div className="text-xs text-[var(--muted)] italic mt-0.5">{g.note}</div>}
                      </td>

                      <td className="p-4">
                        <span className="inline-block font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--surface-strong)] border border-[var(--line)] text-[var(--accent-strong)]">
                          /{g.code}
                        </span>
                      </td>

                      <td className="p-4">
                        {g.eventType === "wedding" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-full">
                            <House size={12} weight="fill" /> Lễ cưới (Tư gia)
                          </span>
                        ) : g.eventType === "reception" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 bg-sky-500/10 px-2.5 py-1 rounded-full">
                            <Buildings size={12} weight="fill" /> Báo hỷ (Unique Q7)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-500/10 px-2.5 py-1 rounded-full">
                            <Sparkle size={12} weight="fill" /> Cả 2 sự kiện
                          </span>
                        )}
                      </td>


                      <td className="p-4 text-xs text-[var(--muted)]">
                        {g.side === "groom" ? "Nhà Trai" : "Nhà Gái"}
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--foreground)]">
                          <Eye size={14} className="text-[var(--muted)]" />
                          {g.viewCount || 0}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(g.code)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              isCopied
                                ? "bg-emerald-600 text-white"
                                : "border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white"
                            }`}
                            title="Copy link gửi Zalo"
                          >
                            {isCopied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
                            <span>{isCopied ? "Đã copy!" : "Copy link"}</span>
                          </button>

                          <a
                            href={`/${g.code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition"
                            title="Mở xem thiệp"
                          >
                            <ArrowSquareOut size={14} />
                          </a>

                          <button
                            type="button"
                            onClick={() => openEditModal(g)}
                            className="inline-flex items-center justify-center p-2 rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--surface-strong)] transition"
                            title="Chỉnh sửa thông tin khách mời"
                          >
                            <PencilSimple size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(g.code, g.name)}
                            className="inline-flex items-center justify-center p-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition"
                            title="Xóa khách"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit Guest Modal */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--background)] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <PencilSimple size={20} className="text-[var(--accent)]" weight="bold" />
                <h3 className="font-display text-xl text-[var(--foreground)]">
                  Chỉnh Sửa Thông Tin Khách Mời
                </h3>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--surface-strong)] transition"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--surface-strong)] border border-[var(--line)] text-xs text-[var(--muted)]">
              <span>Mã mời (link cố định):</span>
              <span className="font-mono font-bold text-sm text-[var(--accent-strong)]">/{editingGuest.code}</span>
              <span className="text-[11px] italic ml-auto text-emerald-600 font-medium">Link không đổi khi sửa</span>
            </div>

            {editError && (
              <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-1.5">
                    Danh Xưng
                  </label>
                  <select
                    value={editSalutation}
                    onChange={(e) => setEditSalutation(e.target.value)}
                    className="w-full min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]"
                  >
                    <option value="Bạn">Bạn</option>
                    <option value="Anh">Anh</option>
                    <option value="Chị">Chị</option>
                    <option value="Em">Em</option>
                    <option value="Cô">Cô</option>
                    <option value="Chú">Chú</option>
                    <option value="Bác">Bác</option>
                    <option value="Cô Chú">Cô Chú</option>
                    <option value="Vợ Chồng">Vợ Chồng</option>
                    <option value="Gia đình">Gia đình</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-1.5">
                    Tên Khách Mời *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-1.5">
                    Sự Kiện Mời
                  </label>
                  <select
                    value={editEventType}
                    onChange={(e) => setEditEventType(e.target.value as EventType)}
                    className="w-full min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]"
                  >
                    <option value="wedding">Lễ Cưới (Tư gia Vĩnh Long)</option>
                    <option value="reception">Tiệc Báo Hỷ (Unique Quận 7)</option>
                    <option value="both">Cả 2 Sự Kiện (Lễ Cưới &amp; Báo Hỷ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-1.5">
                    Khách Bên Nào
                  </label>
                  <select
                    value={editSide}
                    onChange={(e) => setEditSide(e.target.value as "groom" | "bride")}
                    className="w-full min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]"
                  >
                    <option value="groom">Nhà Trai (Quốc Huy)</option>
                    <option value="bride">Nhà Gái (Hoài Thương)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-1.5">
                  Ghi Chú Nội Bộ (Không bắt buộc)
                </label>
                <input
                  type="text"
                  placeholder="VD: Bạn thân đại học, Bàn 03..."
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-strong)] transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editName.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-[var(--accent-contrast)] transition hover:bg-[var(--accent-strong)] disabled:opacity-40 cursor-pointer"
                >
                  <FloppyDisk size={15} weight="fill" />
                  <span>{isSavingEdit ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

