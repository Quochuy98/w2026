"use client";

import { weddingConfig, type GuestInfo, type WeddingEvent } from "@/content/wedding";
import { Reveal } from "./reveal";
import {
  CalendarPlus,
  MapPin,
  Clock,
  Buildings,
  House,
  ArrowSquareOut,
  CalendarCheck,
} from "@phosphor-icons/react";

interface EventDetailsProps {
  guest?: GuestInfo | null;
}

function generateGoogleCalendarUrl(event: WeddingEvent) {
  const startDate = new Date(event.dateIso);
  // Default duration 3 hours
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

  const formatUtc = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

  const title = encodeURIComponent(`${event.title} - ${weddingConfig.groom} & ${weddingConfig.bride}`);
  const details = encodeURIComponent(
    `${event.note || ""}\nĐịa điểm: ${event.venue}${event.hall ? ` - ${event.hall}` : ""}\nĐịa chỉ: ${event.address}`
  );
  const location = encodeURIComponent(`${event.venue}, ${event.address}`);
  const dates = `${formatUtc(startDate)}/${formatUtc(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

function downloadIcsFile(event: WeddingEvent) {
  const startDate = new Date(event.dateIso);
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

  const formatUtc = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QuocHuyHoaiThuong//WeddingInvitation//VI",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title} - ${weddingConfig.groom} & ${weddingConfig.bride}`,
    `DESCRIPTION:${event.note || ""} | ${event.venue} - ${event.address}`,
    `LOCATION:${event.venue}, ${event.address}`,
    `DTSTART:${formatUtc(startDate)}`,
    `DTEND:${formatUtc(endDate)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${event.type === "wedding" ? "le-cuoi-tu-gia" : "tiec-bao-hy"}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function EventCard({ event }: { event: WeddingEvent }) {
  const isWedding = event.type === "wedding";
  const googleCalUrl = generateGoogleCalendarUrl(event);

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/70 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[var(--accent)]/50 sm:p-9">
      <div>
        {/* Top Header Badge */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-3.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            {isWedding ? <House size={14} weight="fill" /> : <Buildings size={14} weight="fill" />}
            <span>{event.badge}</span>
          </span>
          {event.lunarDate && (
            <span className="text-xs text-[var(--muted)]">{event.lunarDate}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-2xl font-normal leading-snug tracking-[-0.03em] text-[var(--foreground)] sm:text-3xl">
          {event.title}
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)]">{event.subTitle}</p>

        {/* Time & Venue Details */}
        <div className="mt-7 space-y-4 rounded-2xl bg-[var(--surface)]/60 p-5 border border-[var(--line)]/60">
          <div className="flex items-start gap-3">
            <Clock size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" weight="duotone" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent-strong)]">Thời Gian</p>
              <p className="text-base font-semibold text-[var(--foreground)]">{event.dateLabel}</p>
              {event.welcomeTime && (
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Đón khách: <span className="font-medium text-[var(--foreground)]">{event.welcomeTime}</span> &bull; Khai tiệc: <span className="font-medium text-[var(--foreground)]">{event.ceremonyTime}</span>
                </p>
              )}
              {!event.welcomeTime && (
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Hôn lễ bắt đầu lúc: <span className="font-medium text-[var(--foreground)]">{event.timeLabel}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3 border-t border-[var(--line)]/60">
            <MapPin size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" weight="duotone" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent-strong)]">Địa Điểm</p>
              <p className="text-base font-semibold text-[var(--foreground)]">
                {event.venue}
                {event.hall && <span className="text-xs font-normal text-[var(--muted)] ml-1.5">({event.hall})</span>}
              </p>
              <p className="text-xs text-[var(--muted)] leading-relaxed mt-0.5">{event.address}</p>
            </div>
          </div>
        </div>

        {/* Note */}
        {event.note && (
          <p className="mt-5 text-xs italic text-[var(--muted)] text-center sm:text-left">
            &ldquo;{event.note}&rdquo;
          </p>
        )}

        {/* Interactive Google Maps Embed if available */}
        {event.mapEmbedUrl && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] aspect-[16/9] w-full shadow-inner">
            <iframe
              src={event.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Bản đồ ${event.venue}`}
              className="grayscale-[30%] contrast-[105%] hover:grayscale-0 transition-all duration-300"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-[var(--line)]">
        {event.mapUrl && (
          <a
            href={event.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-contrast)] shadow-sm transition hover:bg-[var(--accent-strong)] active:scale-[0.98]"
          >
            <ArrowSquareOut size={14} weight="bold" />
            <span>Mở chỉ đường Maps</span>
          </a>
        )}

        <a
          href={googleCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-strong)] active:scale-[0.98]"
          title="Thêm vào Google Calendar"
        >
          <CalendarPlus size={14} weight="bold" />
          <span>Google Calendar</span>
        </a>

        <button
          type="button"
          onClick={() => downloadIcsFile(event)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-strong)] active:scale-[0.98]"
          title="Tải file nhắc lịch Apple Calendar / Outlook (.ics)"
        >
          <CalendarCheck size={14} weight="bold" />
          <span>Apple / ICS</span>
        </button>
      </div>
    </div>
  );
}

export function EventDetails({ guest }: EventDetailsProps) {
  const { wedding, reception } = weddingConfig.events;
  const eventType = guest?.eventType;

  // Khi có mã khách mời, chỉ hiển thị đúng 1 sự kiện mà khách được mời (wedding hoặc reception)
  const showWedding = guest ? eventType === "wedding" : true;
  const showReception = guest ? eventType === "reception" : true;

  const isSingle = (showWedding && !showReception) || (!showWedding && showReception);
  const gridCols = isSingle ? "grid-cols-1 max-w-2xl mx-auto" : "grid-cols-1 lg:grid-cols-2";

  return (
    <section id="events" aria-labelledby="events-heading" className="relative mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
      <Reveal className="mx-auto mb-16 max-w-2xl text-center">
        <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
          Thời Gian &amp; Địa Điểm
        </p>
        <h2
          id="events-heading"
          className="font-display text-4xl leading-[1.05] tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl lg:text-6xl"
        >
          {isSingle && showWedding
            ? "Thông Tin Lễ Cưới Tư Gia"
            : isSingle && showReception
            ? "Thông Tin Tiệc Mừng Báo Hỷ"
            : "Thông Tin Tiệc Cưới"}
        </h2>
        <div className="mx-auto mt-4 h-px w-16 bg-[var(--accent)]/40" />
      </Reveal>

      <div className={`grid gap-8 lg:gap-10 ${gridCols}`}>
        {showWedding && (
          <Reveal>
            <EventCard event={wedding} />
          </Reveal>
        )}

        {showReception && (
          <Reveal>
            <EventCard event={reception} />
          </Reveal>
        )}
      </div>
    </section>
  );
}

