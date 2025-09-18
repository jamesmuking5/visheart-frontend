'use client';
import React, { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';

type Usage = {
  bucket: string;
  fileCount: number;
  totalSize: number;
};

export default function AnalyticsDashboard() {
  const [usage, setUsage] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getS3Usage()
      .then(data => {
        setUsage(data.usage);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>S3 Usage Analytics</h2>
      <table>
        <thead>
          <tr>
            <th>Bucket</th>
            <th>File Count</th>
            <th>Total Size (bytes)</th>
          </tr>
        </thead>
        <tbody>
          {usage.map(u => (
            <tr key={u.bucket}>
              <td>{u.bucket}</td>
              <td>{u.fileCount}</td>
              <td>{u.totalSize}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}