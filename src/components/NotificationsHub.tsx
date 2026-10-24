import React, { useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  CheckCircle2, 
  Trash2, 
  Download, 
  Search, 
  Filter,
  CheckCheck,
  AlertCircle,
  Info
} from 'lucide-react';
import { SecurityAlert, AlertCategory, AlertSeverity } from '../types';

interface NotificationsHubProps {
  alerts: SecurityAlert[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onAcknowledge: (id: string) => void;
  onClearDemoEvents: () => void;
}

export const NotificationsHub: React.FC<NotificationsHubProps> = ({
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
  onAcknowledge,
  onClearDemoEvents
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAlerts = alerts.filter(a => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && a.severity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(alerts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smartguard_security_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cyber-panel rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Security &amp; Safety Notification Hub
              </h2>
              {unreadCount > 0 && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Historical incident logs, intrusion telematics, and biometric driver drowsiness events.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
              Mark All as Read
            </button>
          )}

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Log
          </button>

          <button
            onClick={onClearDemoEvents}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-950/40 border border-red-500/30 hover:border-red-500 text-red-300 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Demo Events
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 cyber-panel rounded-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident title, sensor, or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'security', label: 'Security' },
            { id: 'safety', label: 'Driver Safety' },
            { id: 'controls', label: 'Controls' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
          {(['all', 'critical', 'warning', 'info'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded capitalize font-mono text-[11px] ${
                selectedSeverity === sev 
                  ? 'bg-slate-800 text-white font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="flex flex-col gap-3">
        {filteredAlerts.length === 0 ? (
          <div className="cyber-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400/80 mb-3" />
            <h3 className="text-base font-bold text-white">No Incident Alerts Match Your Filter</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              All vehicle sensors are nominal and operating within safe thresholds.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => onMarkAsRead(alert.id)}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer ${
                !alert.read ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg' : 'bg-slate-950/70 border-slate-800/80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  alert.severity === 'critical' 
                    ? 'bg-red-500/15 border border-red-500/40 text-red-400' 
                    : alert.severity === 'warning'
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                      : 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400'
                }`}>
                  {alert.category === 'security' && <ShieldAlert className="w-5 h-5" />}
                  {alert.category === 'safety' && <Eye className="w-5 h-5" />}
                  {alert.category === 'controls' && <AlertCircle className="w-5 h-5" />}
                  {alert.category === 'location' && <Info className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                      alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {alert.severity}
                    </span>
                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400" title="Unread" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 mt-2">
                    <span>{alert.timestamp}</span>
                    <span>·</span>
                    <span className="capitalize">Channel: {alert.category}</span>
                    {alert.acknowledged && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged by User
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!alert.acknowledged && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcknowledge(alert.id);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 transition-all"
                  >
                    Acknowledge
                  </button>
                )}
                {!alert.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(alert.id);
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
