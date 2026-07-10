"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  Edit, 
  Trash2, 
  PlusCircle,
  LogIn,
  KeyRound,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { getActivityLogs } from "@/lib/api/activity-log-api";

const getActionIcon = (action) => {
  switch (action) {
    case 'CREATE': return <PlusCircle size={20} className="text-green-500" />;
    case 'UPDATE': return <Edit size={20} className="text-blue-500" />;
    case 'DELETE': return <Trash2 size={20} className="text-red-500" />;
    case 'LOGIN': return <CheckCircle2 size={20} className="text-emerald-500" />;
    case 'IMPERSONATE': return <UserCheck size={20} className="text-purple-500" />;
    case 'UPDATE_PASSWORD':
    case 'ADMIN_RESET_PASSWORD':
    case 'FORGOT_PASSWORD_RESET':
      return <KeyRound size={20} className="text-orange-500" />;
    default: return <AlertCircle size={20} className="text-gray-400" />;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: true
  }).format(date);
};

export default function ActivityLogTimeline({ userId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchLogs = async (pageNum) => {
    try {
      if (pageNum === 1) setLoading(true);
      const res = await getActivityLogs(userId, pageNum, 20);
      if (res?.success === 1) {
        if (pageNum === 1) {
          setLogs(res.data.list);
        } else {
          setLogs(prev => [...prev, ...res.data.list]);
        }
        setHasMore(res.data.list.length === 20);
      } else {
        setError(res?.message || 'Failed to fetch logs');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [userId]);

  if (loading && page === 1) {
    return <div className="text-center py-8 text-gray-500">Loading activity logs...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return <div className="text-center py-8 text-gray-500">No activity recorded for this user yet.</div>;
  }

  return (
    <div className="relative border-l border-gray-200 ml-3 py-4 space-y-8 ">
      {logs.map((log) => (
        <div key={log.id} className="relative pl-6">
          <span className="absolute -left-3 top-0 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            {getActionIcon(log.action)}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 ">
            <h4 className="text-sm font-semibold text-gray-900 mt-1">
              {log.description}
            </h4>
            <span className="text-xs text-gray-400 whitespace-nowrap mt-1 sm:mt-0">
              {formatDate(log.createdAt)}
            </span>
          </div>
          {/* <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-600">
              Module: {log.module}
            </span>
            {log.ipAddress && <span>IP: {log.ipAddress}</span>}
          </div> */}
        </div>
      ))}

      {hasMore && (
        <div className="pt-4 pb-2 pl-6">
          <button 
            onClick={() => {
              setPage(p => p + 1);
              fetchLogs(page + 1);
            }}
            disabled={loading}
            className="text-sm font-medium text-[#1565c0] hover:underline"
          >
            {loading ? 'Loading...' : 'Load older activity'}
          </button>
        </div>
      )}
    </div>
  );
}
