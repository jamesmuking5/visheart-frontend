'use client';
import React, { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import { MetricData } from '@/types/system-monitor';
import { formatBytes, getCpuColorClass } from '@/lib/format-utils';

interface MetricState {
  data: MetricData | null;
  loading: boolean;
  error: string | null;
}

export default function AnalyticsDashboard() {
  // Metric states
  const [cpuMetrics, setCpuMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [networkInMetrics, setNetworkInMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [networkOutMetrics, setNetworkOutMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [diskReadMetrics, setDiskReadMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [diskWriteMetrics, setDiskWriteMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  
  // ECR metrics for both repositories
  const [ecrSizeMetrics, setEcrSizeMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [ecrImageCountMetrics, setEcrImageCountMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [ecrBackendSizeMetrics, setEcrBackendSizeMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [ecrBackendImageCountMetrics, setEcrBackendImageCountMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [ecrFrontendSizeMetrics, setEcrFrontendSizeMetrics] = useState<MetricState>({ data: null, loading: true, error: null });
  const [ecrFrontendImageCountMetrics, setEcrFrontendImageCountMetrics] = useState<MetricState>({ data: null, loading: true, error: null });

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
    // Fetch all metrics in parallel
    fetchMetric(analyticsApi.getCpuMetrics, setCpuMetrics, 'CPU');
    fetchMetric(analyticsApi.getNetworkInMetrics, setNetworkInMetrics, 'Network In');
    fetchMetric(analyticsApi.getNetworkOutMetrics, setNetworkOutMetrics, 'Network Out');
    fetchMetric(analyticsApi.getDiskReadMetrics, setDiskReadMetrics, 'Disk Read');
    fetchMetric(analyticsApi.getDiskWriteMetrics, setDiskWriteMetrics, 'Disk Write');
    
    // Legacy ECR metrics (backend repository)
    fetchMetric(analyticsApi.getEcrRepositorySizeMetrics, setEcrSizeMetrics, 'ECR Repository Size');
    fetchMetric(analyticsApi.getEcrImageCountMetrics, setEcrImageCountMetrics, 'ECR Image Count');
    
    // Separate ECR metrics for backend and frontend repositories
    fetchMetric(analyticsApi.getEcrBackendRepositorySizeMetrics, setEcrBackendSizeMetrics, 'ECR Backend Repository Size');
    fetchMetric(analyticsApi.getEcrBackendImageCountMetrics, setEcrBackendImageCountMetrics, 'ECR Backend Image Count');
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
            Showing {metric.data?.values.length || 0} data points from the last {unit === 'percentage' || unit === 'bytes' ? 'hour (5-minute intervals)' : 'week (daily intervals)'}
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

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

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

      <MetricTable 
        title="ECR Repository Size - Legacy (Last Week)" 
        metric={ecrSizeMetrics} 
        unit="bytes"
        description="Total size of all images in the ECR repository (legacy endpoint)"
      />

      <MetricTable 
        title="ECR Image Count - Legacy (Last Week)" 
        metric={ecrImageCountMetrics} 
        unit="count"
        description="Total number of images in the ECR repository (legacy endpoint)"
      />

      {/* Backend Repository Metrics */}
      <MetricTable 
        title="ECR Backend Repository Size (Last Week)" 
        metric={ecrBackendSizeMetrics} 
        unit="bytes"
        description="Total size of all images in the backend ECR repository"
      />

      <MetricTable 
        title="ECR Backend Image Count (Last Week)" 
        metric={ecrBackendImageCountMetrics} 
        unit="count"
        description="Total number of images in the backend ECR repository"
      />

      {/* Frontend Repository Metrics */}
      <MetricTable 
        title="ECR Frontend Repository Size (Last Week)" 
        metric={ecrFrontendSizeMetrics} 
        unit="bytes"
        description="Total size of all images in the frontend ECR repository"
      />

      <MetricTable 
        title="ECR Frontend Image Count (Last Week)" 
        metric={ecrFrontendImageCountMetrics} 
        unit="count"
        description="Total number of images in the frontend ECR repository"
      />
    </div>
  );
}