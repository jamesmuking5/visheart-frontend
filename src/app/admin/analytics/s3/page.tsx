'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, HardDrive, Activity, Download, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi } from '@/lib/api';
import { S3Metrics, MetricData, RequestMetricsSummary, ChartDataPoint } from '@/types/system-monitor';

export default function S3Analytics() {
  const pathname = usePathname();

  const navItems = [
    { name: 'EC2', path: '/admin/analytics/ec2', active: pathname === '/admin/analytics/ec2' },
    { name: 'ECR', path: '/admin/analytics/ecr', active: pathname === '/admin/analytics/ecr' },
    { name: 'S3', path: '/admin/analytics/s3', active: pathname === '/admin/analytics/s3' },
    { name: 'ALB', path: '/admin/analytics/alb', active: pathname === '/admin/analytics/alb' },
    { name: 'ASG', path: '/admin/analytics/asg', active: pathname === '/admin/analytics/asg' },
    { name: 'Cost Metrics', path: '/admin/analytics/cost', active: pathname === '/admin/analytics/cost' },
  ];

  // Color palette for charts
  const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    tertiary: '#f59e0b',
    danger: '#ef4444',
    muted: '#6b7280'
  };

  interface MetricState {
    data: S3Metrics | null;
    loading: boolean;
    error: string | null;
  }

  const [customBucket, setCustomBucket] = useState<string>('');
  const [buckets, setBuckets] = useState<Array<{Name: string, CreationDate: Date}>>([]);
  const [bucketsLoading, setBucketsLoading] = useState<boolean>(true);
  const [bucketsError, setBucketsError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MetricState>({
    data: null,
    loading: false,
    error: null
  });

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Format timestamp for chart display
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit'
    });
  };

  // Fetch metrics for selected bucket
  const fetchMetrics = async (bucketName: string) => {
    if (!bucketName.trim()) {
      setMetrics({ data: null, loading: false, error: 'Please enter a bucket name' });
      return;
    }

    setMetrics({ data: null, loading: true, error: null });

    try {
      const data = await analyticsApi.getAllS3Metrics(bucketName);
      if (data) {
        setMetrics({ data, loading: false, error: null });
      } else {
        setMetrics({ data: null, loading: false, error: 'No data received from server' });
      }
    } catch (error) {
      console.error('Error fetching S3 metrics:', error);
      setMetrics({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics'
      });
    }
  };

  // Handle bucket selection
  const handleBucketSelect = (value: string) => {
    setCustomBucket(value);
    fetchMetrics(value);
  };

  // Refresh current metrics
  const handleRefresh = () => {
    if (customBucket) {
      fetchMetrics(customBucket);
    }
  };

  // Calculate request metrics summary
  const requestSummary: RequestMetricsSummary | null = useMemo(() => {
    if (!metrics.data) return null;

    const latestAll = metrics.data.allRequests.values[metrics.data.allRequests.values.length - 1] || 0;
    const latestGet = metrics.data.getRequests.values[metrics.data.getRequests.values.length - 1] || 0;
    const latestPut = metrics.data.putRequests.values[metrics.data.putRequests.values.length - 1] || 0;

    return {
      total: latestAll,
      get: latestGet,
      put: latestPut,
      other: Math.max(0, latestAll - latestGet - latestPut)
    };
  }, [metrics.data]);

  // Prepare chart data for requests over time
  const requestChartData: ChartDataPoint[] = useMemo(() => {
    if (!metrics.data) return [];

    const maxLength = Math.max(
      metrics.data.allRequests.timestamps.length,
      metrics.data.getRequests.timestamps.length,
      metrics.data.putRequests.timestamps.length
    );

    return Array.from({ length: maxLength }, (_, i) => ({
      timestamp: metrics.data!.allRequests.timestamps[i] || '',
      total: metrics.data!.allRequests.values[i] || 0,
      get: metrics.data!.getRequests.values[i] || 0,
      put: metrics.data!.putRequests.values[i] || 0,
      label: formatTimestamp(metrics.data!.allRequests.timestamps[i] || '')
    }));
  }, [metrics.data]);

  // Prepare pie chart data for request breakdown
  const pieChartData = useMemo(() => {
    if (!requestSummary) return [];

    return [
      { name: 'GET Requests', value: requestSummary.get, color: CHART_COLORS.primary },
      { name: 'PUT Requests', value: requestSummary.put, color: CHART_COLORS.secondary },
      { name: 'Other Requests', value: requestSummary.other, color: CHART_COLORS.tertiary }
    ].filter(item => item.value > 0);
  }, [requestSummary]);

  // Get latest bucket size and object count
  const latestSize = metrics.data?.bucketSizeBytes.values[metrics.data.bucketSizeBytes.values.length - 1] || 0;
  const latestObjects = metrics.data?.numberOfObjects.values[metrics.data.numberOfObjects.values.length - 1] || 0;

  // Fetch buckets on component mount
  useEffect(() => {
    const fetchBuckets = async () => {
      setBucketsLoading(true);
      setBucketsError(null);
      try {
        const data = await analyticsApi.getS3Buckets();
        if (data && data.buckets) {
          setBuckets(data.buckets);
        } else {
          setBucketsError('No buckets found');
        }
      } catch (error) {
        console.error('Error fetching S3 buckets:', error);
        setBucketsError(error instanceof Error ? error.message : 'Failed to fetch buckets');
      } finally {
        setBucketsLoading(false);
      }
    };

    fetchBuckets();
  }, []);

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
      <div className="ml-64 flex-1">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">S3 Metrics Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor Amazon S3 bucket storage and request metrics via CloudWatch
            </p>
          </div>

          {/* Bucket Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                S3 Bucket Selection
              </CardTitle>
              <CardDescription>
                Select an S3 bucket from your AWS account to view metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  {bucketsLoading ? (
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading buckets...</span>
                    </div>
                  ) : bucketsError ? (
                    <div className="p-2 border border-red-200 rounded-md bg-red-50">
                      <span className="text-sm text-red-600">Error loading buckets: {bucketsError}</span>
                    </div>
                  ) : (
                    <Select onValueChange={(value) => {
                      setCustomBucket(value);
                      fetchMetrics(value);
                    }} value={customBucket}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an S3 bucket..." />
                      </SelectTrigger>
                      <SelectContent>
                        {buckets.map((bucket) => (
                          <SelectItem key={bucket.Name} value={bucket.Name}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{bucket.Name}</span>
                              <Badge variant="outline" className="text-xs">
                                {new Date(bucket.CreationDate).toLocaleDateString()}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {customBucket && (
                  <Button variant="outline" onClick={handleRefresh} disabled={metrics.loading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                )}
              </div>

              {customBucket && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Current bucket:</span>
                  <Badge variant="secondary">{customBucket}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading State */}
          {metrics.loading && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading S3 metrics for {customBucket}...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {metrics.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error loading metrics:</strong> {metrics.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Metrics Display */}
          {metrics.data && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bucket Size</CardTitle>
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatBytes(latestSize)}</div>
                    <p className="text-xs text-muted-foreground">
                      Standard storage
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Number of Objects</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(latestObjects)}</div>
                    <p className="text-xs text-muted-foreground">
                      All storage types
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(requestSummary?.total || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      All request types
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">GET/PUT Ratio</CardTitle>
                    <div className="flex gap-1">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {requestSummary?.put ? (requestSummary.get / requestSummary.put).toFixed(1) : '∞'}:1
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Read vs Write ratio
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Storage Metrics Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Storage Metrics Over Time</CardTitle>
                    <CardDescription>
                      Bucket size and object count trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics.data.bucketSizeBytes.timestamps.map((timestamp, i) => ({
                          timestamp: formatTimestamp(timestamp),
                          size: metrics.data?.bucketSizeBytes.values[i] || 0,
                          objects: metrics.data?.numberOfObjects.values[i] || 0
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" />
                          <YAxis yAxisId="size" orientation="left" tickFormatter={formatBytes} />
                          <YAxis yAxisId="objects" orientation="right" tickFormatter={formatNumber} />
                          <Tooltip
                            labelFormatter={(value) => `Date: ${value}`}
                            formatter={(value: any, name: string) => [
                              name === 'size' ? formatBytes(value) : formatNumber(value),
                              name === 'size' ? 'Bucket Size' : 'Object Count'
                            ]}
                          />
                          <Legend />
                          <Line
                            yAxisId="size"
                            type="monotone"
                            dataKey="size"
                            stroke={CHART_COLORS.primary}
                            strokeWidth={2}
                            name="Bucket Size"
                          />
                          <Line
                            yAxisId="objects"
                            type="monotone"
                            dataKey="objects"
                            stroke={CHART_COLORS.secondary}
                            strokeWidth={2}
                            name="Object Count"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Request Metrics Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Request Metrics Over Time</CardTitle>
                    <CardDescription>
                      API request volume trends by type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={requestChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis tickFormatter={formatNumber} />
                          <Tooltip
                            labelFormatter={(value) => `Time: ${value}`}
                            formatter={(value: any, name: string) => [
                              formatNumber(value),
                              name.toUpperCase() + ' Requests'
                            ]}
                          />
                          <Legend />
                          <Bar dataKey="total" fill={CHART_COLORS.primary} name="Total" />
                          <Bar dataKey="get" fill={CHART_COLORS.secondary} name="GET" />
                          <Bar dataKey="put" fill={CHART_COLORS.tertiary} name="PUT" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Request Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Request Breakdown</CardTitle>
                  <CardDescription>
                    Distribution of request types for the latest period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => `${entry.name}: ${formatNumber(Number(entry.value))}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => formatNumber(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
                            <span className="text-sm font-medium">GET Requests</span>
                          </div>
                          <span className="text-sm font-bold">{formatNumber(requestSummary?.get || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.secondary }} />
                            <span className="text-sm font-medium">PUT Requests</span>
                          </div>
                          <span className="text-sm font-bold">{formatNumber(requestSummary?.put || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.tertiary }} />
                            <span className="text-sm font-medium">Other Requests</span>
                          </div>
                          <span className="text-sm font-bold">{formatNumber(requestSummary?.other || 0)}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Requests</span>
                        <span className="text-lg font-bold">{formatNumber(requestSummary?.total || 0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Empty State */}
          {!metrics.loading && !metrics.error && !metrics.data && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bucket Selected</h3>
                <p className="text-muted-foreground">
                  Enter an S3 bucket name above to view CloudWatch metrics
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}