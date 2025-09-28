'use client';
import React, { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import { CpuMetrics } from '@/types/system-monitor';

type Usage = {
  bucket: string;
  fileCount: number;
  totalSize: number;
};

export default function AnalyticsDashboard() {
  const [usage, setUsage] = useState<Usage[]>([]);
  const [cpuMetrics, setCpuMetrics] = useState<CpuMetrics | null>(null);
  const [s3Loading, setS3Loading] = useState(true);
  const [cpuLoading, setCpuLoading] = useState(true);
  const [cpuError, setCpuError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch S3 usage data
    analyticsApi.getS3Usage()
      .then(data => {
        setUsage(data.usage);
        setS3Loading(false);
      })
      .catch(() => setS3Loading(false));

    // Fetch CPU metrics
    analyticsApi.getCpuMetrics()
      .then(data => {
        if (data) {
          setCpuMetrics(data);
          setCpuError(null);
        } else {
          setCpuError('Failed to load CPU metrics');
        }
        setCpuLoading(false);
      })
      .catch(error => {
        setCpuError('Failed to load CPU metrics');
        setCpuLoading(false);
        console.error('Error fetching CPU metrics:', error);
      });
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      
      {/* S3 Usage Analytics Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">S3 Usage Analytics</h2>
        {s3Loading ? (
          <div>Loading S3 usage...</div>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Bucket</th>
                <th className="border border-gray-300 px-4 py-2 text-left">File Count</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Total Size (bytes)</th>
              </tr>
            </thead>
            <tbody>
              {usage.map(u => (
                <tr key={u.bucket}>
                  <td className="border border-gray-300 px-4 py-2">{u.bucket}</td>
                  <td className="border border-gray-300 px-4 py-2">{u.fileCount}</td>
                  <td className="border border-gray-300 px-4 py-2">{u.totalSize?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CPU Metrics Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">EC2 CPU Utilization (Last Hour)</h2>
        {cpuLoading ? (
          <div>Loading metrics...</div>
        ) : cpuError ? (
          <div className="text-red-600">{cpuError}</div>
        ) : cpuMetrics && cpuMetrics.timestamps.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Showing {cpuMetrics.values.length} data points from the last hour (5-minute intervals)
            </p>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Timestamp</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">CPU Utilization (%)</th>
                </tr>
              </thead>
              <tbody>
                {cpuMetrics.timestamps.map((timestamp, index) => (
                  <tr key={timestamp}>
                    <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                      {new Date(timestamp).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`font-semibold ${
                        cpuMetrics.values[index] > 80 ? 'text-red-600' :
                        cpuMetrics.values[index] > 60 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {cpuMetrics.values[index]}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500">No CPU metrics data available for the last hour.</div>
        )}
      </div>
    </div>
  );
}