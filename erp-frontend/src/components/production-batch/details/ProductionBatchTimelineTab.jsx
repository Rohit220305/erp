import React from "react";
import NoDataMessage from "@/components/common/NoDataMessage";

export default function ProductionBatchTimelineTab({
  timelineEvents = [],
  processes = [],
  handleOpenProcessDrawer,
  onOpenDrawer,
}) {
  if (!timelineEvents || timelineEvents.length === 0) {
    return <NoDataMessage moduleName="Process Timeline" />;
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "Started":
        return "text-green-600";
      case "Paused":
        return "text-yellow-600";
      case "Resumed":
        return "text-teal-600";
      case "Completed":
        return "text-red-500";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm min-h-full">
      <h3 className="text-[14px] font-bold text-gray-700 mb-6 border-b border-gray-100 pb-2">
        Process Timeline
      </h3>

      <div className="relative border-l-2 border-[#1565c0] ml-[140px] pl-8 space-y-4">
        {timelineEvents.map((event, index) => {
          const isCompleted = event.action === "Completed";
          const relatedProcess = isCompleted
            ? processes.find((p) => Number(p.id) === Number(event.productionBatchProcessId))
            : null;
          const timeTaken = relatedProcess?.formattedTimeTaken;

          return (
            <div key={event.id || index} className="relative flex flex-col justify-center">
              {/* Timestamp positioned to the left of the line */}
              <div className="absolute -left-[180px] w-[130px] text-right">
                <span className="text-[12px] font-medium text-gray-600 leading-none">
                  {event.actionAtFormatted}
                </span>
              </div>

              {/* Blue Circular Marker */}
              <div className="absolute -left-[40px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-white border-4 border-[#1565c0] rounded-full"></div>

              {/* Event Card / Details */}
              <div className="flex-1 bg-gray-50/50 rounded-md p-3 border border-gray-100 shadow-sm space-y-1">
                <div className="text-[13px] font-semibold text-gray-800">
                  Process Name :{" "}
                  <button
                    type="button"
                    onClick={() => onOpenDrawer("Process", event.processId)}
                    className="text-[#1565c0] font-medium hover:underline cursor-pointer"
                  >
                    {event.processName || "Unknown"}
                  </button>
                </div>
                <div className="text-[13px] font-semibold text-gray-800">
                  Type :{" "}
                  <span className={`${getTypeColor(event.action)} font-medium`}>
                    {event.action}
                  </span>
                </div>

                {isCompleted && timeTaken && (
                  <div className="text-[13px] font-semibold text-gray-800">
                    Time Taken : <span className="font-medium text-gray-600">{timeTaken}</span>
                  </div>
                )}

                <div className="text-[13px] font-semibold text-gray-800">
                  By :{" "}
                  <button
                    type="button"
                    onClick={() => onOpenDrawer("User", event.actionById)}
                    className="text-[#1565c0] font-medium hover:underline cursor-pointer"
                  >
                    {event.actionByName || "Unknown"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
