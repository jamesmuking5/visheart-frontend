'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

// Predefined S3 buckets (you can extend this)
const PREDEFINED_BUCKETS = [
  { name: 'dev-fyp-b', region: 'ap-southeast-1', description: 'Development Bucket' },
  { name: 'devel-visheart-s3-bucket', region: 'ap-southeast-1', description: 'Production Bucket' },
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

const S3MetricsDashboard: React.FC = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [customBucket, setCustomBucket] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
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
      setMetrics({ data: null, loading: false, error: 'Please select or enter a bucket name' });
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
    if (value === 'custom') {
      setIsCustomMode(true);
      setSelectedBucket('');
    } else {
      setIsCustomMode(false);
      setSelectedBucket(value);
      setCustomBucket('');
      fetchMetrics(value);
    }
  };

  // Handle custom bucket submission
  const handleCustomBucketSubmit = () => {
    if (customBucket.trim()) {
      setSelectedBucket(customBucket.trim());
      fetchMetrics(customBucket.trim());
    }
  };

  // Refresh current metrics
  const handleRefresh = () => {
    const bucketToRefresh = isCustomMode ? customBucket : selectedBucket;
    if (bucketToRefresh) {
      fetchMetrics(bucketToRefresh);
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

  return (
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
            Select a predefined bucket or enter a custom bucket name to view metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select onValueChange={handleBucketSelect} value={isCustomMode ? 'custom' : selectedBucket}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an S3 bucket or choose custom..." />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_BUCKETS.map((bucket) => (
                    <SelectItem key={bucket.name} value={bucket.name}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{bucket.name}</span>
                        <Badge variant="outline">{bucket.region}</Badge>
                        <span className="text-sm text-muted-foreground">- {bucket.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <Separator className="my-2" />
                  <SelectItem value="custom">
                    <span className="font-medium">🔧 Custom bucket name...</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isCustomMode && (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter bucket name..."
                  value={customBucket}
                  onChange={(e) => setCustomBucket(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomBucketSubmit()}
                  className="min-w-64"
                />
                <Button onClick={handleCustomBucketSubmit} disabled={!customBucket.trim()}>
                  Load Metrics
                </Button>
              </div>
            )}

            {(selectedBucket || customBucket) && (
              <Button variant="outline" onClick={handleRefresh} disabled={metrics.loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>

          {selectedBucket && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Current bucket:</span>
              <Badge variant="secondary">{selectedBucket}</Badge>
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
              <span>Loading S3 metrics for {selectedBucket || customBucket}...</span>
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
              Select an S3 bucket from the dropdown above to view CloudWatch metrics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default S3MetricsDashboard;