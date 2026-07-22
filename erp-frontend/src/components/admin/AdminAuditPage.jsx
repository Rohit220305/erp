"use client";

import { useEffect, useState, Fragment } from "react";
import { useHeader } from "@/context/HeaderContext";
import { getAllActivityLogs } from "@/lib/api/activity-log-api";
import { 
  Search, 
  Calendar, 
  User, 
  Activity, 
  Layers, 
  Database,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminActivityLogsPage() {
  const { setConfig, resetConfig } = useHeader();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    module: "",
    action: "",
    actorUserId: "",
    entityId: ""
  });
  
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const backendFilters = [];
      if (filters.startDate) backendFilters.push({ key: 'createdAt', operator: 'greater than equal', value: filters.startDate });
      if (filters.endDate) backendFilters.push({ key: 'createdAt', operator: 'less than equal', value: `${filters.endDate} 23:59:59` });
      if (filters.actorUserId) backendFilters.push({ key: 'actorUserId', operator: 'equal', value: Number(filters.actorUserId) });
      if (filters.entityId) backendFilters.push({ key: 'entityId', operator: 'equal', value: Number(filters.entityId) });
      if (filters.module) backendFilters.push({ key: 'module', operator: 'equal', value: filters.module });
      if (filters.action) backendFilters.push({ key: 'action', operator: 'equal', value: filters.action });

      const res = await getAllActivityLogs({
        page: pageNum,
        limit,
        filters: backendFilters.length > 0 ? backendFilters : undefined,
      });

      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      const data = res?.settings?.data || res?.data || {};

      if (isSuccess) {
        setLogs(data.list || []);
        setTotal(data.pagination?.total || 0);
        setPage(pageNum);
      } else {
        toast.error(res?.message || res?.settings?.message || "Failed to fetch logs");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred fetching logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: [],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: "System Activity Logs",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "Activity Logs", href: "/admin/activity-logs" },
        ],
        actionButton: null,
      },
    });
    setTimeout(() => fetchLogs(1), 0);
    return () => resetConfig();
  }, [setConfig, resetConfig]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleReset = () => {
    setFilters({
      startDate: "",
      endDate: "",
      module: "",
      action: "",
      actorUserId: "",
      entityId: ""
    });
    setTimeout(() => fetchLogs(1), 0);
  };

  const toggleExpandLog = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <form onSubmit={handleSearch} className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="text-[#1565c0] w-5 h-5" />
            <h3 className="font-semibold text-gray-800 text-lg">Filter Audit Logs</h3>
          </div>
          <button 
            type="button" 
            onClick={handleReset} 
            className="text-xs font-medium text-[#1565c0] hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Calendar size={12} /> Start Date
            </label>
            <input 
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full text-sm bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1565c0] transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Calendar size={12} /> End Date
            </label>
            <input 
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full text-sm bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1565c0] transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Layers size={12} /> Module
            </label>
            <select
              name="module"
              value={filters.module}
              onChange={handleFilterChange}
              className="w-full text-sm bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1565c0] transition"
            >
              <option value="">All Modules</option>
              <option value="AUTH">AUTH</option>
              <option value="USER">USER</option>
              <option value="COMPANY">COMPANY</option>
              <option value="GROUP">GROUP</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Activity size={12} /> Action
            </label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full text-sm bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1565c0] transition"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="IMPERSONATE">IMPERSONATE</option>
              <option value="RETURN_SESSION">RETURN_SESSION</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <User size={12} /> Actor ID
            </label>
            <input 
              type="number"
              name="actorUserId"
              value={filters.actorUserId}
              onChange={handleFilterChange}
              placeholder="e.g. 5"
              className="w-full text-sm bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1565c0] transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Database size={12} /> Entity ID
            </label>
            <input 
              type="number"
              name="entityId"
              value={filters.entityId}
              onChange={handleFilterChange}
              placeholder="e.g. 10"
              className="w-full text-sm bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1565c0] transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#1565c0] hover:bg-[#0f57a6] text-white px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <Search size={16} /> Filter Logs
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Actor ID</th>
                <th className="py-4 px-6">Impersonator</th>
                <th className="py-4 px-6">Action</th>
                <th className="py-4 px-6">Module</th>
                <th className="py-4 px-6">Entity ID</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (  
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-400">Loading audit logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-400">No logs found matching filters.</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <Fragment key={log.id}>
                      <tr className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs">{log.actorUserId}</td>
                        <td className="py-4 px-6">
                          {log.impersonatorId ? (
                            <span className="inline-block bg-purple-50 text-purple-700 border border-purple-100 text-xs px-2.5 py-0.5 rounded-full font-medium">
                              Via Admin {log.impersonatorId}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                            log.action === "CREATE" ? "bg-green-50 text-green-700 border border-green-100" :
                            log.action === "UPDATE" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            log.action === "DELETE" ? "bg-red-50 text-red-700 border border-red-100" :
                            log.action === "LOGIN" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            "bg-gray-50 text-gray-700 border border-gray-100"
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-xs">{log.module}</td>
                        <td className="py-4 px-6 font-mono text-xs">{log.entityId || "—"}</td>
                        <td className="py-4 px-6 max-w-xs truncate" title={log.description}>{log.description}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => toggleExpandLog(log.id)}
                            className="text-[#1565c0] hover:text-[#0f57a6] p-1 rounded-md hover:bg-gray-100/80 transition cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan="8" className="py-4 px-6 border-t border-gray-100">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-white p-3 rounded-lg border border-gray-100">
                                <div>
                                  <span className="font-semibold text-gray-500 block">IP Address</span>
                                  <span className="font-mono text-gray-700">{log.ipAddress || "Unknown"}</span>
                                </div>
                                <div className="col-span-3">
                                  <span className="font-semibold text-gray-500 block">User Agent</span>
                                  <span className="text-gray-700">{log.userAgent || "Unknown"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="bg-white border-t border-gray-150 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing page {page} of {totalPages} ({total} entries total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page === 1}
                className="px-3.5 py-1.5 border border-gray-200 rounded-md text-xs font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page === totalPages}
                className="px-3.5 py-1.5 border border-gray-200 rounded-md text-xs font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
