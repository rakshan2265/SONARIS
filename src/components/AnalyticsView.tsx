import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Download, Calendar, Layers, Anchor, MapPin } from 'lucide-react';
import { DetectionResult } from '../types/detection';

const exportCsvReport = (result: DetectionResult | null) => {
  if (!result || result.boundingBoxes.length === 0) {
    alert('Run a detection first - there is nothing to export yet.');
    return;
  }
  const rows = [
    ['label', 'confidence', 'x_percent', 'y_percent', 'width_percent', 'height_percent', 'latitude', 'longitude'],
    ...result.boundingBoxes.map(b => {
      const latVal = b.latitude !== undefined && b.latitude !== null
        ? b.latitude.toFixed(4)
        : (result.latitude !== undefined && result.latitude !== null ? result.latitude.toFixed(4) : 'Not Available');
      const lngVal = b.longitude !== undefined && b.longitude !== null
        ? b.longitude.toFixed(4)
        : (result.longitude !== undefined && result.longitude !== null ? result.longitude.toFixed(4) : 'Not Available');
      const confVal = (b.confidence > 1 ? b.confidence / 100 : b.confidence).toFixed(2);
      return [
        b.label,
        confVal,
        b.x.toFixed(2),
        b.y.toFixed(2),
        b.width.toFixed(2),
        b.height.toFixed(2),
        latVal,
        lngVal,
      ];
    }),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sonaris_anomaly_report.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const AnalyticsView: React.FC<{ latestResult?: DetectionResult | null }> = ({ latestResult }) => {
  const metrics = [
    { title: 'Images Scanned', value: '4,892', change: '+14% this month', icon: Layers, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { title: 'Debris Detected', value: '12,410', change: '+280 items today', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { title: 'Model Accuracy', value: '93.8%', change: 'Precision 0.94 / Recall 0.92', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: 'Shipwrecks & Hazards', value: '84', change: 'Acoustic sonar verified', icon: Anchor, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  ];

  const debrisBreakdown = [
    { name: 'Plastic Bottles & Containers', percentage: 38, count: '4,715 items', color: 'bg-[#1d72f2]' },
    { name: 'Submerged Tires & Rubber', percentage: 21, count: '2,606 items', color: 'bg-[#f59e0b]' },
    { name: 'Metal Beverage Cans', percentage: 19, count: '2,357 items', color: 'bg-[#10b981]' },
    { name: 'Ghost Fishing Nets & Gear', percentage: 14, count: '1,737 items', color: 'bg-[#ef4444]' },
    { name: 'Shipwreck & Marine Wreckage', percentage: 8, count: '995 items', color: 'bg-[#8b5cf6]' },
  ];

  const monthlyData = [
    { month: 'Apr', scans: 450, debris: 1100 },
    { month: 'May', scans: 620, debris: 1540 },
    { month: 'Jun', scans: 810, debris: 2100 },
    { month: 'Jul', scans: 990, debris: 2680 },
    { month: 'Aug', scans: 1140, debris: 3100 },
    { month: 'Sep', scans: 882, debris: 1890 },
  ];

  const maxDebris = Math.max(...monthlyData.map(d => d.debris));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1a73e8]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Marine Debris Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive telemetry, detection frequencies, and debris classification statistics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportCsvReport(latestResult ?? null)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{m.title}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-800">{m.value}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>{m.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debris Classification Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Debris Class Distribution</h3>
          <p className="text-xs text-slate-500">Breakdown of labeled items across all historical sonar & camera sweeps</p>

          <div className="space-y-3.5 pt-2">
            {debrisBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>{item.name}</span>
                  <span className="text-slate-500">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Visual Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Detection Trend (6 Months)</h3>
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>2026 Telemetry</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">Debris volume identified per survey period</p>
          </div>

          <div className="pt-8 pb-2 flex items-end justify-between gap-3 h-48 border-b border-slate-100">
            {monthlyData.map((d, idx) => {
              const heightPercent = Math.round((d.debris / maxDebris) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.debris}
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end justify-center p-1">
                    <div
                      className="w-full bg-gradient-to-t from-[#1a73e8] to-[#38bdf8] rounded-t-md transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]" /> Total Debris Identified
            </span>
            <span>Peak Detection: August 2026</span>
          </div>
        </div>
      </div>

      {/* On-Screen Survey Detection Telemetry & Report Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1a73e8]" />
              <span>Active Survey Detection Report & Geolocation Telemetry</span>
            </h3>
            <p className="text-xs text-slate-500">
              Granular object bounding box coordinates, confidence ratings, and geographic GPS positions
            </p>
          </div>
          {latestResult && latestResult.boundingBoxes.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200 self-start sm:self-auto">
              {latestResult.boundingBoxes.length} Object{latestResult.boundingBoxes.length > 1 ? 's' : ''} Tagged
            </span>
          )}
        </div>

        {latestResult && latestResult.boundingBoxes.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">#</th>
                  <th className="py-2.5 px-3.5">Object Label</th>
                  <th className="py-2.5 px-3.5">Confidence</th>
                  <th className="py-2.5 px-3.5">Bounding Box (X, Y, W, H)</th>
                  <th className="py-2.5 px-3.5 text-blue-700">Latitude</th>
                  <th className="py-2.5 px-3.5 text-blue-700">Longitude</th>
                  <th className="py-2.5 px-3.5">GPS Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestResult.boundingBoxes.map((box, idx) => {
                  const lat = box.latitude !== undefined && box.latitude !== null
                    ? box.latitude.toFixed(4)
                    : (latestResult.latitude !== undefined && latestResult.latitude !== null ? latestResult.latitude.toFixed(4) : null);
                  const lng = box.longitude !== undefined && box.longitude !== null
                    ? box.longitude.toFixed(4)
                    : (latestResult.longitude !== undefined && latestResult.longitude !== null ? latestResult.longitude.toFixed(4) : null);
                  const hasGps = lat !== null && lng !== null;
                  const confVal = box.confidence > 1 ? box.confidence / 100 : box.confidence;

                  return (
                    <tr key={box.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: box.color || '#38bdf8' }} />
                        <span>{box.label}</span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-medium text-emerald-600">
                        {confVal.toFixed(2)} ({(confVal * 100).toFixed(0)}%)
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px]">
                        [{box.x.toFixed(1)}%, {box.y.toFixed(1)}%, {box.width.toFixed(1)}%, {box.height.toFixed(1)}%]
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-medium text-slate-800">
                        {hasGps ? `${lat}° N` : <span className="text-slate-400 italic">Not Available</span>}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-medium text-slate-800">
                        {hasGps ? `${lng}° E` : <span className="text-slate-400 italic">Not Available</span>}
                      </td>
                      <td className="py-2.5 px-3.5">
                        {hasGps ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            GPS Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                            Not Available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <MapPin className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
            <p className="font-medium text-slate-600">No active detection items to report yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Upload and run inference on a sonar image to generate live telemetry coordinates and reports
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
