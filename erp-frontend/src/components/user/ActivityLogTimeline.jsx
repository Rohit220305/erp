"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Edit,
  Trash2,
  PlusCircle,
  KeyRound,
  UserCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { getActivityLogs } from "@/lib/api/activity-log-api";
import dayjs from "dayjs";

export default function ActivityLogTimeline({ userId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [activeShortcut, setActiveShortcut] = useState(null);

  const triggerRef = useRef(null);
  const [triggerRect, setTriggerRect] = useState({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });

  const fetchLogs = async (pageNum, start = startDate, end = endDate) => {
    try {
      if (pageNum === 1) setLoading(true);
      const startStr = start
        ? dayjs(start).startOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;
      const endStr = end
        ? dayjs(end).endOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;

      const res = await getActivityLogs(userId, pageNum, 10, startStr, endStr);
      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      const data = res?.settings?.data || res?.data || {};

      if (isSuccess) {
        if (pageNum === 1) {
          setLogs(data.list || []);
        } else {
          setLogs((prev) => [...prev, ...(data.list || [])]);
        }
        setHasMore(data.list?.length === 10);
        setPage(pageNum);
      } else {
        setError(
          res?.message || res?.settings?.message || "Failed to fetch logs",
        );
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [userId, startDate, endDate]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, "month"));
  };

  const handleDateClick = (date) => {
    setActiveShortcut(null);
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date.isBefore(startDate, "day")) {
        setStartDate(date);
      } else {
        setEndDate(date);
        setIsPickerOpen(false);
      }
    }
  };

  const handleDateMouseEnter = (date) => {
    if (startDate && !endDate) {
      setHoverDate(date);
    }
  };

  const applyShortcut = (label, getValue) => {
    const [start, end] = getValue();
    setStartDate(start);
    setEndDate(end);
    setActiveShortcut(label);
    if (start) {
      setCurrentMonth(start);
    }
    setIsPickerOpen(false);
  };

  const togglePicker = () => {
    if (!isPickerOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect(rect);
    }
    setIsPickerOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isPickerOpen) return;
    const updatePosition = () => {
      if (triggerRef.current) {
        setTriggerRect(triggerRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isPickerOpen]);

  const shortcuts = [
    {
      label: "Today",
      getValue: () => {
        const today = dayjs();
        return [today, today];
      },
    },
    {
      label: "Yesterday",
      getValue: () => {
        const yesterday = dayjs().subtract(1, "day");
        return [yesterday, yesterday];
      },
    },
    {
      label: "This Week",
      getValue: () => {
        const today = dayjs();
        return [today.startOf("week"), today.endOf("week")];
      },
    },
    {
      label: "Last Week",
      getValue: () => {
        const today = dayjs();
        const prevWeek = today.subtract(7, "day");
        return [prevWeek.startOf("week"), prevWeek.endOf("week")];
      },
    },
    {
      label: "Last 7 Days",
      getValue: () => {
        const today = dayjs();
        return [today.subtract(7, "day"), today];
      },
    },
    {
      label: "Current Month",
      getValue: () => {
        const today = dayjs();
        return [today.startOf("month"), today.endOf("month")];
      },
    },
    {
      label: "Next Month",
      getValue: () => {
        const today = dayjs();
        const startOfNextMonth = today.endOf("month").add(1, "day");
        return [startOfNextMonth, startOfNextMonth.endOf("month")];
      },
    },
    {
      label: "Reset",
      getValue: () => [null, null],
    },
  ];

  const renderCalendarDays = (month) => {
    const startOfMonth = month.startOf("month");
    const startDay = startOfMonth.day();
    const totalDays = month.daysInMonth();

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
    }

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const date = month.date(dayNum);
      const isStart = startDate && date.isSame(startDate, "day");
      const isEnd = endDate && date.isSame(endDate, "day");

      let inRange = false;
      if (startDate && endDate) {
        inRange =
          date.isAfter(startDate, "day") && date.isBefore(endDate, "day");
      } else if (startDate && hoverDate && !endDate) {
        inRange =
          (date.isAfter(startDate, "day") && date.isBefore(hoverDate, "day")) ||
          date.isSame(hoverDate, "day");
      }

      days.push(
        <button
          key={`day-${dayNum}`}
          type="button"
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => handleDateMouseEnter(date)}
          className={`w-9 h-9 text-xs font-semibold rounded-full flex items-center justify-center transition-all ${
            isStart || isEnd
              ? "bg-blue-600 text-white font-bold ring-1 ring-blue-600 ring-offset-1"
              : inRange
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-none"
                : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {dayNum}
        </button>,
      );
    }

    return days;
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "CREATE":
        return <PlusCircle size={20} className="text-green-500" />;
      case "UPDATE":
        return <Edit size={20} className="text-blue-500" />;
      case "DELETE":
        return <Trash2 size={20} className="text-red-500" />;
      case "LOGIN":
        return <CheckCircle2 size={20} className="text-emerald-500" />;
      case "IMPERSONATE":
        return <UserCheck size={20} className="text-purple-500" />;
      case "UPDATE_PASSWORD":
      case "ADMIN_RESET_PASSWORD":
      case "FORGOT_PASSWORD_RESET":
        return <KeyRound size={20} className="text-orange-500" />;
      default:
        return <AlertCircle size={20} className="text-gray-400" />;
    }
  };

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  const getPopoverStyle = () => {
    if (typeof window === "undefined") return {};
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      return {
        position: "fixed",
        top: `${triggerRect.bottom + 8}px`,
        left: "16px",
        right: "16px",
        zIndex: 10000,
      };
    }

    const rightVal = window.innerWidth - triggerRect.right;
    return {
      position: "fixed",
      top: `${triggerRect.bottom + 8}px`,
      right: `${rightVal}px`,
      zIndex: 10000,
    };
  };

  return (
    <div className="space-y-6 h-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-3 px-10">
        <h3 className="font-semibold text-lg">Activity Logs</h3>
        <div className="relative inline-block">
          <button
            ref={triggerRef}
            type="button"
            onClick={togglePicker}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
          >
            <Calendar size={14} className="text-gray-400" />
            <span>
              {startDate ? startDate.format("MMM D, YYYY") : "Start"}
              {" – "}
              {endDate ? endDate.format("MMM D, YYYY") : "End"}
            </span>
          </button>

          {isPickerOpen &&
            createPortal(
              <>
                <div
                  className="fixed inset-0 z-[9999]"
                  onClick={() => setIsPickerOpen(false)}
                />

                <div
                  style={getPopoverStyle()}
                  className="bg-white rounded-xl shadow-xl border border-gray-100 p-5 flex flex-col md:flex-row gap-6"
                  onMouseLeave={() => setHoverDate(null)}
                >
                 <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 min-w-[130px] border-b md:border-b-0 md:border-r border-gray-100 pr-0 md:pr-4">
                    {shortcuts.map((shortcut) => {
                      const isSelected =
                        activeShortcut === shortcut.label ||
                        (shortcut.label === "Reset" && !startDate && !endDate);
                      return (
                        <button
                          key={shortcut.label}
                          type="button"
                          onClick={() =>
                            applyShortcut(shortcut.label, shortcut.getValue)
                          }
                          className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-full transition-all text-left cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          {shortcut.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex-grow flex flex-col justify-center">
                    <div className="flex flex-col mb-4 px-1">
                      <span className="text-[10px] tracking-wider text-gray-400 font-bold uppercase">
                        SELECT DATE RANGE
                      </span>
                      <span className="text-base font-bold text-gray-900 mt-0.5">
                        {startDate ? startDate.format("MMMM D, YYYY") : "Start"}
                        {" – "}
                        {endDate ? endDate.format("MMMM D, YYYY") : "End"}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                     <div className="flex-grow">
                        <div className="flex items-center justify-between px-1 mb-3">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-600 cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-bold text-gray-800">
                            {currentMonth.format("MMMM YYYY")}
                          </span>
                          <div className="w-6" />
                        </div>

                        <div className="grid grid-cols-7 gap-x-1 gap-y-1 mb-2 text-center text-[10px] font-bold text-gray-400">
                          {weekdays.map((w, idx) => (
                            <div key={`wk-left-${idx}`} className="w-9">
                              {w}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-x-1 gap-y-1 justify-items-center">
                          {renderCalendarDays(currentMonth)}
                        </div>
                      </div>

                      <div className="hidden md:block w-[1px] bg-gray-100 self-stretch" />

                      <div className="flex-grow">
                        <div className="flex items-center justify-between px-1 mb-3">
                          <div className="w-6" />
                          <span className="text-xs font-bold text-gray-800">
                            {currentMonth.add(1, "month").format("MMMM YYYY")}
                          </span>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-600 cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-x-1 gap-y-1 mb-2 text-center text-[10px] font-bold text-gray-400">
                          {weekdays.map((w, idx) => (
                            <div key={`wk-right-${idx}`} className="w-9">
                              {w}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-x-1 gap-y-1 justify-items-center">
                          {renderCalendarDays(currentMonth.add(1, "month"))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>,
              document.body,
            )}
        </div>
      </div>
      <div className="overflow-y-scroll h-[90%] pb-1  px-6">
        <div className="bg-white p-6">
          {loading && page === 1 ? (
            <div className="text-center py-8 text-gray-500">
              Loading activity logs...
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activity recorded for this user yet.
            </div>
          ) : (
            <div className="relative border-l border-gray-200 ml-3 py-2 space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  <span className="absolute -left-3.5 top-0 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
                    {getActionIcon(log.action)}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 mt-1">
                      {log.description}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap mt-1 sm:mt-0">
                      {formatDateLabel(log.createdAt)}
                    </span>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="pt-4 pb-2 pl-6">
                  <button
                    onClick={() => {
                      fetchLogs(page + 1);
                    }}
                    disabled={loading}
                    className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
                  >
                    {loading ? "Loading..." : "Load older activity"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
