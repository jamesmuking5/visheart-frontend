"use client";

import React, { useState, useEffect, useCallback } from "react";
import { statusApi } from "@/lib/api";
import { GpuStatus, GpuSystemStatus } from "@/types/system-monitor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Server,
  Clock,
} from "lucide-react";

// Helper function to get status color and icon
const getStatusDisplay = (status: string) => {
  switch (status.toLowerCase()) {
    case "ok":
    case "online":
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-100",
        badge: "default" as const,
      };
    case "degraded":
      return {
        icon: AlertCircle,
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        badge: "secondary" as const,
      };
    case "timeout":
      return {
        icon: Clock,
        color: "text-red-600",
        bg: "bg-red-100",
        badge: "destructive" as const,
      };
    case "offline":
    case "error":
      return {
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-100",
        badge: "destructive" as const,
      };
    default:
      return {
        icon: AlertCircle,
        color: "text-gray-600",
        bg: "bg-gray-100",
        badge: "outline" as const,
      };
  }
};

// Helper function to format bytes
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Helper function to format uptime
const formatUptime = (days: number) => {
  if (days < 1) {
    const hours = Math.floor(days * 24);
    const minutes = Math.floor((days * 24 * 60) % 60);
    return `${hours}h ${minutes}m`;
  }
  return `${Math.floor(days)} days`;
};

export default function SystemMonitorPage() {
  const [gpuStatus, setGpuStatus] = useState<GpuStatus | null>(null);
  const [gpuSystemStatus, setGpuSystemStatus] = useState<GpuSystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [gpuResponse, systemResponse] = await Promise.allSettled([
        statusApi.getGpuStatus(),
        statusApi.getGpuSystemStatus(),
      ]);

      if (gpuResponse.status === "fulfilled") {
        const response = gpuResponse.value;
        // Check for timeout indicators in the response
        const hasTimeoutCode = response.details?.code === "ETIMEDOUT";
        const hasTimeoutMessage = response.message?.toLowerCase?.().includes?.("timeout") ||
                                 response.details?.includes?.("timeout");
        
        if (hasTimeoutCode || hasTimeoutMessage) {
          console.log("⏰ [SystemMonitor] GPU status timeout detected");
          setGpuStatus({
            ...response,
            status: "timeout"
          });
        } else {
          setGpuStatus(response);
        }
      } else {
        console.error("Failed to fetch GPU status:", gpuResponse.reason);
        // Create a fallback timeout status if the promise was rejected due to network issues
        setGpuStatus({
          status: "timeout",
          message: "Failed to fetch GPU status - connection timeout",
          details: { code: "NETWORK_ERROR" }
        });
      }

      if (systemResponse.status === "fulfilled") {
        const response = systemResponse.value;
        // Check for timeout indicators in the system response too
        const hasTimeoutCode = response.details?.code === "ETIMEDOUT";
        const hasTimeoutMessage = response.message?.toLowerCase?.().includes?.("timeout");
        
        if (hasTimeoutCode || hasTimeoutMessage) {
          console.log("⏰ [SystemMonitor] GPU system status timeout detected");
          setGpuSystemStatus({
            ...response,
            status: "timeout"
          });
        } else {
          setGpuSystemStatus(response);
        }
      } else {
        console.error("Failed to fetch GPU system status:", systemResponse.reason);
        // Create a fallback timeout status if the promise was rejected due to network issues
        setGpuSystemStatus({
          status: "timeout",
          message: "Failed to fetch GPU system status - connection timeout",
          details: {
            status: "timeout",
            cpu: { usage_percent: 0, core_count: 0, status: "unknown" },
            memory: { total_gb: 0, used_gb: 0, usage_percent: 0, status: "unknown" },
            disk: { total_gb: 0, used_gb: 0, usage_percent: 0, status: "unknown" },
            system: { platform: "", release: "", boot_time: "", uptime_days: 0 },
            timestamp: new Date().toISOString()
          }
        });
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to fetch system data");
      console.error("System monitor error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemData, 30000);
    return () => clearInterval(interval);
  }, [fetchSystemData]);

  const gpuStatusDisplay = getStatusDisplay(gpuStatus?.status || "offline");
  const systemStatusDisplay = getStatusDisplay(gpuSystemStatus?.status || "offline");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitor</h1>
          <p className="text-muted-foreground">
            Monitor GPU and server system status in real-time
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <Button onClick={fetchSystemData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">GPU Server Status</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <gpuStatusDisplay.icon className={`h-5 w-5 ${gpuStatusDisplay.color}`} />
              <Badge variant={gpuStatusDisplay.badge}>
                {gpuStatus?.status?.toUpperCase() || "UNKNOWN"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {gpuStatus?.message || "No data available"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <systemStatusDisplay.icon className={`h-5 w-5 ${systemStatusDisplay.color}`} />
              <Badge variant={systemStatusDisplay.badge}>
                {gpuSystemStatus?.status?.toUpperCase() || "UNKNOWN"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {gpuSystemStatus?.message || "No data available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GPU Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          <h2 className="text-2xl font-bold">GPU Information</h2>
        </div>

        {gpuStatus?.details && 'gpu' in gpuStatus.details ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GPU Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-muted-foreground text-sm">Name:</span>
                  <p className="font-medium">{gpuStatus.details.gpu.gpu_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Architecture:</span>
                  <p className="font-medium">{gpuStatus.details.gpu.architecture}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">CUDA Version:</span>
                  <p className="font-medium">{gpuStatus.details.gpu.cuda_version}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GPU Memory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>
                      {formatBytes(gpuStatus.details.gpu.memory_used_mb * 1024 * 1024)} / 
                      {formatBytes(gpuStatus.details.gpu.memory_total_mb * 1024 * 1024)}
                    </span>
                  </div>
                  <Progress 
                    value={(gpuStatus.details.gpu.memory_used_mb / gpuStatus.details.gpu.memory_total_mb) * 100}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GPU Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Utilization</span>
                    <span>{gpuStatus.details.gpu.gpu_utilization_percent}%</span>
                  </div>
                  <Progress 
                    value={gpuStatus.details.gpu.gpu_utilization_percent}
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusDisplay(gpuStatus.details.gpu.status).badge}>
                    {gpuStatus.details.gpu.status.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No GPU Data Available</h3>
                <p className="text-muted-foreground">
                  Unable to fetch GPU information. The GPU server may be offline.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Server Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Server Information</h2>
        </div>

        {gpuSystemStatus?.details ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">CPU</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span>{gpuSystemStatus.details.cpu.usage_percent}%</span>
                  </div>
                  <Progress 
                    value={gpuSystemStatus.details.cpu.usage_percent}
                    className="mt-2"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Cores:</span>
                  <p className="font-medium">{gpuSystemStatus.details.cpu.core_count}</p>
                </div>
                <Badge variant={getStatusDisplay(gpuSystemStatus.details.cpu.status).badge}>
                  {gpuSystemStatus.details.cpu.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Memory</CardTitle>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span>
                      {gpuSystemStatus.details.memory.used_gb.toFixed(1)} GB / 
                      {gpuSystemStatus.details.memory.total_gb.toFixed(1)} GB
                    </span>
                  </div>
                  <Progress 
                    value={gpuSystemStatus.details.memory.usage_percent}
                    className="mt-2"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Usage:</span>
                  <p className="font-medium">{gpuSystemStatus.details.memory.usage_percent}%</p>
                </div>
                <Badge variant={getStatusDisplay(gpuSystemStatus.details.memory.status).badge}>
                  {gpuSystemStatus.details.memory.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Disk</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span>
                      {gpuSystemStatus.details.disk.used_gb.toFixed(1)} GB / 
                      {gpuSystemStatus.details.disk.total_gb.toFixed(1)} GB
                    </span>
                  </div>
                  <Progress 
                    value={gpuSystemStatus.details.disk.usage_percent}
                    className="mt-2"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Usage:</span>
                  <p className="font-medium">{gpuSystemStatus.details.disk.usage_percent}%</p>
                </div>
                <Badge variant={getStatusDisplay(gpuSystemStatus.details.disk.status).badge}>
                  {gpuSystemStatus.details.disk.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            {/* System Info Card */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg">System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <span className="text-muted-foreground text-sm">Platform:</span>
                    <p className="font-medium">{gpuSystemStatus.details.system.platform}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Release:</span>
                    <p className="font-medium">{gpuSystemStatus.details.system.release}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Boot Time:</span>
                    <p className="font-medium">{gpuSystemStatus.details.system.boot_time}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Uptime:</span>
                    <p className="font-medium">{formatUptime(gpuSystemStatus.details.system.uptime_days)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Server className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Server Data Available</h3>
                <p className="text-muted-foreground">
                  Unable to fetch server information. Please check the system status.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
