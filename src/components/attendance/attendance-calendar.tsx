"use client";

import { useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import type { EventContentArg } from "@fullcalendar/core";
import type { AttendanceRecord } from "@prisma/client";

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  onDateClick: (date: Date) => void;
}

export function AttendanceCalendar({
  records,
  onDateClick,
}: AttendanceCalendarProps) {
  // 근태 기록을 FullCalendar 이벤트로 변환
  const events = records.map((record) => {
    const hasOvertime = (record.overtime || 0) > 0;
    const hasNightWork = (record.nightWork || 0) > 0;

    return {
      id: record.id,
      date: record.date,
      title: record.isConfirmed ? "확정" : "미확정",
      backgroundColor: record.isConfirmed ? "#3b82f6" : "#f3f4f6",
      borderColor: record.isConfirmed ? "#2563eb" : "#e5e7eb",
      textColor: record.isConfirmed ? "#ffffff" : "#6b7280",
      extendedProps: {
        hasOvertime,
        hasNightWork,
        isConfirmed: record.isConfirmed,
      },
    };
  });

  const handleDateClick = useCallback(
    (arg: DateClickArg) => {
      onDateClick(arg.date);
    },
    [onDateClick]
  );

  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const { hasOvertime, hasNightWork } = eventInfo.event.extendedProps;

    return (
      <div className="flex items-center gap-1 px-1 py-0.5 text-xs">
        <span className="flex-1 truncate">{eventInfo.event.title}</span>
        <div className="flex gap-1">
          {hasOvertime && (
            <div
              className="w-2 h-2 rounded-full bg-orange-500"
              title="연장근로"
            />
          )}
          {hasNightWork && (
            <div
              className="w-2 h-2 rounded-full bg-purple-500"
              title="야간근로"
            />
          )}
        </div>
      </div>
    );
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4">
      <style>{`
        .fc {
          --fc-border-color: hsl(var(--border));
          --fc-button-bg-color: hsl(var(--primary));
          --fc-button-border-color: hsl(var(--primary));
          --fc-button-hover-bg-color: hsl(var(--primary) / 0.9);
          --fc-button-hover-border-color: hsl(var(--primary) / 0.9);
          --fc-button-active-bg-color: hsl(var(--primary) / 0.8);
          --fc-button-active-border-color: hsl(var(--primary) / 0.8);
          --fc-today-bg-color: hsl(var(--accent));
        }

        .fc .fc-button {
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
          text-transform: capitalize;
        }

        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .fc .fc-daygrid-day {
          cursor: pointer;
        }

        .fc .fc-daygrid-day:hover {
          background-color: hsl(var(--accent));
        }

        .fc .fc-daygrid-day-number {
          padding: 0.25rem;
          font-size: 0.875rem;
        }

        .fc .fc-event {
          cursor: default;
          margin: 1px 2px;
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        buttonText={{
          today: "오늘",
        }}
        height="auto"
        events={events}
        dateClick={handleDateClick}
        eventContent={renderEventContent}
        dayMaxEvents={3}
        weekends={true}
        fixedWeekCount={false}
      />
    </div>
  );
}
