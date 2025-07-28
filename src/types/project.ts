// This is the type definitions for projects and their segmentation masks in the VisHeart frontend application.
// Most should be similar to the backend types (database_types.ts)

/**
 * ProjectInfo is the metadata for a project in the VisHeart application.
 */
export interface ProjectInfo {
  projectId: string;
  name: string;
  description: string;
  isSaved: boolean;
  filesize: number;
  filetype: string;
  dimensions?: {
    width: number;
    height: number;
    slices?: number;
    frames?: number;
  };
  voxelsize?: {
    x: number;
    y: number;
    z?: number;
    t?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ComponentBoundingBoxesClass is a enum for types of classes for component bounding boxes.
 */
export enum ComponentBoundingBoxesClass {
  RV = "rv",
  MYO = "myo",
  LVC = "lvc",
  MANUAL = "manual", // Added for manual segmentations from GPU
}

/**
 * Job status enum matching backend JobStatus
 */
export enum JobStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS", 
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

/**
 * Interface for individual job data returned from /user-check-jobs endpoint
 */
export interface UserJob {
  jobId: string;           // job.uuid from backend
  projectId: string;       // job.projectid from backend (mapped to camelCase)
  status: JobStatus;       // job.status (JobStatus enum values)
  queuePosition: number | null; // Position in queue if status is PENDING, null otherwise
}

/**
 * Interface for the complete response from /segmentation/user-check-jobs endpoint
 */
export interface UserJobsResponse {
  success: boolean;
  activeJobCount: number;  // Count of jobs with PENDING or IN_PROGRESS status
  totalJobs: number;       // Total number of jobs returned (up to 20)
  jobs: UserJob[];         // Array of user's jobs
}

/**
 * Error response interface for failed requests
 */
export interface UserJobsErrorResponse {
  success: false;
  message: string;
}

/**
 * SegmentationMask is the metadata for a segmentation mask associated with a project.
 */
export interface SegmentationMask {
  _id: string;
  projectid: string;
  name: string;
  description?: string;
  isSaved: boolean;
  segmentationmaskRLE: boolean;
  isMedSAMOutput: boolean; // Important - indicates if manual or AI output
  frames: {
    frameindex: number;
    frameinferred: boolean;
    slices: {
      sliceindex: number;
      componentboundingboxes?: {
        class: ComponentBoundingBoxesClass;
        confidence: number;
        x_min: number;
        y_min: number;
        x_max: number;
        y_max: number;
      }[];
      segmentationmasks?: {
        class: ComponentBoundingBoxesClass;
        segmentationmaskcontents: string;
      }[];
    }[];
  }[];
}
