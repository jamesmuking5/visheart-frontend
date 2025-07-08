export interface GpuStatus {
  status: "online" | "offline" | "degraded" | "timeout";
  message: string;
  details: {
    status: string;
    gpu: {
      gpu_name: string;
      architecture: string;
      cuda_version: string;
      memory_total_mb: number;
      memory_used_mb: number;
      gpu_utilization_percent: number;
      status: string;
    };
  } | {
    code?: string;
  };
}

export interface GpuSystemStatus {
  status: "online" | "offline" | "degraded" | "timeout";
  message: string;
  details: {
    status: string;
    cpu: {
      usage_percent: number;
      core_count: number;
      status: string;
    };
    memory: {
      total_gb: number;
      used_gb: number;
      usage_percent: number;
      status: string;
    };
    disk: {
      total_gb: number;
      used_gb: number;
      usage_percent: number;
      status: string;
    };
    system: {
      platform: string;
      release: string;
      boot_time: string;
      uptime_days: number;
    };
    timestamp: string;
  };
}

export interface SystemMonitorData {
  gpuStatus: GpuStatus | null;
  gpuSystemStatus: GpuSystemStatus | null;
  isLoading: boolean;
  lastUpdated: Date | null;
}
