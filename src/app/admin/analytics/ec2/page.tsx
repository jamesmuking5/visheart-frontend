'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { analyticsApi } from '@/lib/api';
import { MetricData } from '@/types/system-monitor';
import { formatBytes, getCpuColorClass } from '@/lib/format-utils';

interface MetricState {
  data: MetricData | null;
  loading: boolean;
  error: string | null;
}

export default function EC2Analytics() {
  const pathname = usePathname();

  // EC2 Metric states
  const [cpuMetrics, setCpuMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [networkInMetrics, setNetworkInMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [networkOutMetrics, setNetworkOutMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [diskReadMetrics, setDiskReadMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [diskWriteMetrics, setDiskWriteMetrics] = useState<MetricState>({ data: null, loading: true, error: null });

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
    // Fetch EC2 metrics
    fetchMetric(analyticsApi.getCpuMetrics, setCpuMetrics, 'CPU');
    fetchMetric(analyticsApi.getNetworkInMetrics, setNetworkInMetrics, 'Network In');
    fetchMetric(analyticsApi.getNetworkOutMetrics, setNetworkOutMetrics, 'Network Out');
    fetchMetric(analyticsApi.getDiskReadMetrics, setDiskReadMetrics, 'Disk Read');
    fetchMetric(analyticsApi.getDiskWriteMetrics, setDiskWriteMetrics, 'Disk Write');
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
            Showing {metric.data?.values.length || 0} data points from the last hour (5-minute intervals)
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
                        <span className={`font-semibold ${getCpuColorClass(metric.data?.values[index] || 0)}`}>
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
        <div className="text-gray-500">No {title.toLowerCase()} data available for the last hour.</div>
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
        <h1 className="text-2xl font-bold">EC2 Analytics</h1>

        {/* EC2 Metrics Sections */}
        <MetricTable
          title="EC2 CPU Utilization (Last Hour)"
          metric={cpuMetrics}
          unit="percentage"
          description="Average CPU utilization percentage for the EC2 instance"
        />

        <MetricTable
          title="EC2 Network In (Last Hour)"
          metric={networkInMetrics}
          unit="bytes"
          description="Total bytes received by the network interface"
        />

        <MetricTable
          title="EC2 Network Out (Last Hour)"
          metric={networkOutMetrics}
          unit="bytes"
          description="Total bytes sent by the network interface"
        />

        <MetricTable
          title="EC2 Disk Read (Last Hour)"
          metric={diskReadMetrics}
          unit="bytes"
          description="Total bytes read from all EBS volumes attached to the instance"
        />

        <MetricTable
          title="EC2 Disk Write (Last Hour)"
          metric={diskWriteMetrics}
          unit="bytes"
          description="Total bytes written to all EBS volumes attached to the instance"
        />
      </div>
    </div>
  );
}