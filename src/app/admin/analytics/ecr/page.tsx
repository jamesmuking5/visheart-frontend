'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { analyticsApi } from '@/lib/api';
import { MetricData } from '@/types/system-monitor';
import { formatBytes } from '@/lib/format-utils';

interface MetricState {
  data: MetricData | null;
  loading: boolean;
  error: string | null;
}

export default function ECRAnalytics() {
  const pathname = usePathname();

  // ECR metrics for both repositories (Pull Count metrics - size/count not available in CloudWatch)
  const [ecrBackendPullCountMetrics, setEcrBackendPullCountMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [ecrFrontendPullCountMetrics, setEcrFrontendPullCountMetrics] = useState<MetricState>({ data: null, loading: true, error: null });

  // Helper function to fetch metrics
  const fetchMetric = async (
    fetchFunction: () => Promise<MetricData | null>,
    setState: React.Dispatch<React.SetStateAction<MetricState>>,
    metricName: string
  ) => {
    try {
      const data = await fetchFunction();
      if (data) {
        setState({ data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: `Failed to load ${metricName} metrics` });
      }
    } catch (error) {
      setState({ data: null, loading: false, error: `Failed to load ${metricName} metrics` });
      console.error(`Error fetching ${metricName} metrics:`, error);
    }
  };

  useEffect(() => {
    // Fetch ECR metrics (Pull Count - size/count metrics not available in CloudWatch)
    fetchMetric(analyticsApi.getEcrBackendRepositoryPullCountMetrics, setEcrBackendPullCountMetrics, 'ECR Backend Repository Pull Count');
    fetchMetric(analyticsApi.getEcrFrontendRepositoryPullCountMetrics, setEcrFrontendPullCountMetrics, 'ECR Frontend Repository Pull Count');
    fetchMetric(analyticsApi.getEcrFrontendRepositorySizeMetrics, setEcrFrontendSizeMetrics, 'ECR Frontend Repository Size');
    fetchMetric(analyticsApi.getEcrFrontendImageCountMetrics, setEcrFrontendImageCountMetrics, 'ECR Frontend Image Count');
  }, []);

  // Component for rendering metric table
  const MetricTable = ({
    title,
    metric,
    unit,
    description
  }: {
    title: string;
    metric: MetricState;
    unit: 'percentage' | 'bytes' | 'count';
    description: string;
  }) => (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {metric.loading ? (
        <div>Loading metrics...</div>
      ) : metric.error ? (
        <div className="text-red-600">{metric.error}</div>
      ) : metric.data && metric.data.timestamps.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Showing {metric.data?.values.length || 0} data points from the last week (daily intervals)
          </p>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Timestamp</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    {unit === 'percentage' ? 'CPU Utilization (%)' :
                     unit === 'count' ? 'Count' : 'Value'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {metric.data?.timestamps.map((timestamp, index) => (
                  <tr key={timestamp}>
                    <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                      {new Date(timestamp).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {unit === 'percentage' ? (
                        <span className="font-semibold">
                          {metric.data?.values[index]}%
                        </span>
                      ) : unit === 'count' ? (
                        <span className="font-semibold">
                          {metric.data?.values[index]?.toLocaleString() || 0}
                        </span>
                      ) : (
                        <span className="font-semibold">
                          {formatBytes(metric.data?.values[index] || 0)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No {title.toLowerCase()} data available for the last week.</div>
      )}
    </div>
  );

  const navItems = [
    { name: 'EC2', path: '/admin/analytics/ec2', active: pathname === '/admin/analytics/ec2' },
    { name: 'ECR', path: '/admin/analytics/ecr', active: pathname === '/admin/analytics/ecr' },
    { name: 'S3', path: '/admin/analytics/s3', active: pathname === '/admin/analytics/s3' },
    { name: 'ALB', path: '/admin/analytics/alb', active: pathname === '/admin/analytics/alb' },
    { name: 'ASG', path: '/admin/analytics/asg', active: pathname === '/admin/analytics/asg' },
    { name: 'Cost Metrics', path: '/admin/analytics/cost', active: pathname === '/admin/analytics/cost' },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white h-screen fixed left-0 top-0 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Analytics</h2>
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`block px-4 py-2 rounded ${
                      item.active ? 'bg-gray-700' : 'hover:bg-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6 space-y-8 flex-1">
        <h1 className="text-2xl font-bold">ECR Analytics</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Note: Limited ECR Metrics Available
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>AWS ECR only provides <strong>RepositoryPullCount</strong> metrics in CloudWatch. Repository size and image count metrics are not available through CloudWatch and would require ECR API calls instead.</p>
              </div>
            </div>
          </div>
        </div>

        <MetricTable
          title="ECR Backend Repository Pull Count (Last Week)"
          metric={ecrBackendPullCountMetrics}
          unit="count"
          description="Number of image pulls from the backend ECR repository"
        />

        <MetricTable
          title="ECR Frontend Repository Pull Count (Last Week)"
          metric={ecrFrontendPullCountMetrics}
          unit="count"
          description="Number of image pulls from the frontend ECR repository"
        />
      </div>
    </div>
  );
}