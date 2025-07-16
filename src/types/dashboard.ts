export interface Project {
    projectId: string;
    name: string;
    description: string;
    isSaved: boolean;
    filesize: number;
    filetype: string;
    dimensions: {
      width: number;
      height: number;
      depth: number;
      slices?: number;
      frames?: number;
    };
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Job {
    jobId: string;
    projectId: string;
    status: string;
    message: string;
    createdAt: string;
  }
  
  export interface UserStats {
    projectCount: number;
    totalFileSize: number;
    completedSegmentations: number;
    pendingJobs: number;
  }
  
  export interface SystemStats {
    totalUsers: number;
    totalProjects: number;
    pendingJobs: number;
    completedJobs: number;
    failedJobs: number;
  }
  