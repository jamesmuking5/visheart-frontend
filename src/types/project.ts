// This is the type definitions for projects and their segmentation masks in the VisHeart frontend application.
// Most should be similar to the backend types (database_types.ts)

// Enumerations matching backend
export enum FileType {
  NIFTI = "application/octet-stream", // .nii
  NIFTI_GZ = "application/gzip", // .nii.gz
  NIFTI_GZ_2 = "application/x-gzip", // .nii.gz alternate variant
  DICOM = "application/dicom", // .dcm
}

export enum FileDataType {
  UNKNOWN = "unknown",
  FLOAT32 = "float32",
  UINT16 = "uint16",
  UINT8 = "uint8",
  INT16 = "int16",
  INT32 = "int32",
  UINT32 = "uint32",
  FLOAT64 = "float64",
}

export enum ComponentBoundingBoxesClass {
  RV = "rv",
  MYO = "myo",
  LVC = "lvc",
  MANUAL = "manual", // Added for manual segmentations from GPU
}

export enum JobStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum SegmentationSource {
  AI_INFERENCE = "ai_inference",
  MANUAL_INFERENCE = "manual_inference",
}

// Core interfaces matching backend structure

/**
 * Project dimensions interface
 */
export interface ProjectDimensions {
  width: number; // Width of the image in pixels
  height: number; // Height of the image in pixels
  slices: number; // Depth/Slices of the image in pixels (for 3D images)
  frames?: number; // Time/Frames dimension (optional, for 4D images)
}

/**
 * Project voxel size interface
 * Physical size of one voxel (usually in mm)
 */
export interface ProjectVoxelSize {
  x: number; // Voxel size in the X dimension (mm)
  y: number; // Voxel size in the Y dimension (mm)
  z?: number; // Voxel size in the Z dimension (mm, optional)
  t?: number; // Voxel size in the T dimension (seconds, optional)
}

/**
 * Main project interface matching backend IProject
 */
export interface IProject {
  _id?: string; // MongoDB Object ID of the project
  userid: string; // MongoDB User ID of the user who uploaded the file
  
  // User inputs
  name: string; // Name of the project
  originalfilename: string; // Original filename
  description: string; // Description of the project
  isSaved: boolean; // Indicates if the project is saved in the database
  
  // File properties
  filename: string; // Server rename - e.g., userid_projid.nii
  filetype: FileType; // MIME type of the file
  filesize: number; // Size of the renamed file in bytes
  filehash: string; // SHA256 hash of the renamed file
  
  // Location tracking
  basepath: string; // Base path for the file storage (e.g., S3 bucket URL + user + filehash)
  originalfilepath: string; // Original (nifti/dicom) file location (e.g., S3 bucket URL)
  extractedfolderpath: string; // Saves the folder where all the extracted jpeg from nifti are saved
  
  // File specifics
  datatype: FileDataType; // Data type of the image (e.g., uint8, float32)
  dimensions: ProjectDimensions; // Dimensions of the image
  voxelsize?: ProjectVoxelSize; // Physical size of one voxel (optional)

  // Timestamps (based on mongoose timestamp)
  createdAt?: Date; // Creation date of the project
  updatedAt?: Date; // Last update date of the project
}

/**
 * Component bounding box interface for segmentation masks
 */
export interface ComponentBoundingBox {
  class: ComponentBoundingBoxesClass; // Class of the component (e.g., rv, myo, lvc)
  confidence: number; // Confidence score of the bounding box
  x_min: number; // X coordinate of the minimum bounding box corner
  y_min: number; // Y coordinate of the minimum bounding box corner
  x_max: number; // X coordinate of the maximum bounding box corner
  y_max: number; // Y coordinate of the maximum bounding box corner
}

/**
 * Segmentation mask content interface
 */
export interface SegmentationMask {
  class: ComponentBoundingBoxesClass; // Class of the component (e.g., rv, myo, lvc)
  segmentationmaskcontents: string; // The contents of the segmentation mask (e.g., RLE format)
}

/**
 * Slice interface for segmentation masks
 */
export interface SegmentationSlice {
  sliceindex: number; // The index of the slice (0-based)
  componentboundingboxes?: ComponentBoundingBox[]; // Array of component bounding boxes (optional)
  segmentationmasks?: SegmentationMask[]; // Array of segmentation masks (optional)
}

/**
 * Frame interface for segmentation masks
 */
export interface SegmentationFrame {
  frameindex: number; // The index of the frame (0-based)
  frameinferred: boolean; // Indicates if the frame has been inferred
  slices: SegmentationSlice[]; // Array of slices for the frame
}

/**
 * Project segmentation mask interface matching backend IProjectSegmentationMask
 */
export interface IProjectSegmentationMask {
  _id?: string; // MongoDB Object ID of the segmentation mask
  projectid: string; // MongoDB Project ID of the project to which the segmentation mask belongs
  
  // User inputs
  name: string; // Name of the segmentation mask
  description?: string; // Description of the segmentation mask (optional)
  isSaved: boolean; // Indicates if the segmentation mask is saved in the database
  segmentationmaskRLE: boolean; // Indicates if the mask is in RLE format
  isMedSAMOutput: boolean; // Indicates if the segmentation mask is a MedSAM output
  
  // Segmentation data
  frames: SegmentationFrame[]; // Array of frames for the segmentation mask

  // Timestamps (based on mongoose timestamp)
  createdAt?: Date; // Creation date of the segmentation mask
  updatedAt?: Date; // Last update date of the segmentation mask
}

/**
 * Job interface for tracking segmentation jobs
 */
export interface IJob {
  _id?: string; // MongoDB Object ID of the job
  userid: string; // ID of the user who created the job
  projectid: string; // ID of the project associated with the job
  uuid: string; // UUID of the job (for tracking purposes)
  status: JobStatus; // Current status of the job
  result?: string; // Result of the job (e.g., path to the output file, success message, etc.)
  message?: string; // Optional error message if the job fails
  segmentationName?: string; // Optional user-defined name for the resulting segmentation
  segmentationDescription?: string; // Optional user-defined description for the resulting segmentation
  segmentationSource?: SegmentationSource; // Source of the image for segmentation
  
  // Timestamps
  createdAt?: Date; // Creation date of the job
  updatedAt?: Date; // Last update date of the job
}

// API Response types matching backend CRUD result interfaces

/**
 * Base API response interface
 */
export interface BaseApiResponse {
  success: boolean;
  message?: string;
}

/**
 * Project CRUD result interface matching backend ProjectCrudResult
 */
export interface ProjectCrudResult extends BaseApiResponse {
  operation?: string; // The type of operation performed (CREATE, READ, UPDATE, DELETE)
  project?: IProject; // Single project (for CREATE, UPDATE operations)
  projects?: IProject[]; // Array of projects (for READ operations)
}

/**
 * Project segmentation mask CRUD result interface matching backend ProjectSegmentationMaskCrudResult
 */
export interface ProjectSegmentationMaskCrudResult extends BaseApiResponse {
  operation?: string; // The type of operation performed (CREATE, READ, UPDATE, DELETE)
  projectsegmentationmask?: IProjectSegmentationMask; // Single segmentation mask (for CREATE, UPDATE operations)
  projectsegmentationmasks?: IProjectSegmentationMask[]; // Array of segmentation masks (for READ operations)
}

/**
 * Job CRUD result interface matching backend JobCrudResult
 */
export interface JobCrudResult extends BaseApiResponse {
  operation?: string; // The type of operation performed (CREATE, READ, UPDATE, DELETE)
  job?: IJob; // Single job (for CREATE, UPDATE operations)
  jobs?: IJob[]; // Array of jobs (for READ operations)
}

// Frontend-specific interfaces for API responses and UI state

/**
 * Project list API response interface
 * Example JSON: { "projects": [...] }
 */
export interface ProjectListResponse {
  projects: Array<{
    projectId: string;
    name: string;
    description: string;
    isSaved: boolean;
    filesize: number;
    filetype: FileType;
    dimensions: ProjectDimensions;
    voxelsize?: ProjectVoxelSize;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  message?: string; // For error cases
}

/**
 * Project info API response interface
 * Example JSON: { "success": true, "project": {...} }
 */
export interface ProjectInfoResponse extends BaseApiResponse {
  project: {
    projectId: string;
    name: string;
    description: string;
    isSaved: boolean;
    filesize: number;
    filetype: FileType;
    dimensions: ProjectDimensions;
    voxelsize?: ProjectVoxelSize;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

/**
 * Segmentation results API response interface
 * Example JSON: { "segmentations": [...] } or { "message": "No segmentation masks found", "segmentations": [] }
 */
export interface SegmentationResultsResponse {
  segmentations: IProjectSegmentationMask[];
  message?: string; // For no results or error cases
}

/**
 * Job status response interface
 * Example JSON: { "success": true, "activeJobCount": 2, "totalJobs": 5, "jobs": [...] }
 */
export interface JobStatusResponse extends BaseApiResponse {
  activeJobCount: number;
  totalJobs: number;
  jobs: Array<{
    jobId: string;
    projectId: string;
    status: JobStatus;
    queuePosition?: number | null;
  }>;
}

/**
 * Start segmentation response interface
 * Example JSON: { "message": "Inference started successfully", "uuid": "abc-123-def" }
 */
export interface StartSegmentationResponse {
  message: string;
  uuid: string;
}

/**
 * Project presigned URL response interface
 * Example JSON: { "success": true, "presignedUrl": "https://...", "expiresAt": 1234567890 }
 */
export interface ProjectPresignedUrlResponse extends BaseApiResponse {
  presignedUrl: string;
  expiresAt: number;
}

/**
 * Export project data response interface
 * Example JSON: { 
 *   "success": true, 
 *   "message": "NIfTI segmentation exported successfully.",
 *   "projectId": "proj123",
 *   "projectName": "My Project",
 *   "exportPackageUrl": "https://...",
 *   "exportPackageUrlExpiresAt": 1234567890,
 *   "exportContentType": "application/gzip"
 * }
 */
export interface ExportProjectDataResponse extends BaseApiResponse {
  projectId: string;
  projectName: string;
  exportPackageUrl: string;
  exportPackageUrlExpiresAt: number;
  exportContentType: string;
}

/**
 * Save manual segmentation response interface
 * Example JSON: { 
 *   "success": true, 
 *   "message": "Manual segmentation updated and saved successfully.",
 *   "segmentation": {...}
 * }
 */
export interface SaveManualSegmentationResponse extends BaseApiResponse {
  segmentation: IProjectSegmentationMask;
}

// Frontend utility types

/**
 * Project filter options for querying projects
 */
export interface ProjectFilters {
  projectid?: string;
  name?: string;
  filetype?: FileType | FileType[];
  daterange?: {
    start?: string; // ISO date string
    end?: string; // ISO date string
  };
}

/**
 * Manual segmentation request interface
 * Example JSON: {
 *   "image_name": "slice_0_frame_1.jpeg",
 *   "bbox": [10, 20, 100, 200],
 *   "segmentationName": "My Segmentation",
 *   "segmentationDescription": "Description here"
 * }
 */
export interface ManualSegmentationRequest {
  image_name: string;
  bbox: [number, number, number, number]; // Array of 4 numbers [x_min, y_min, x_max, y_max]
  segmentationName?: string;
  segmentationDescription?: string;
}

/**
 * Save manual segmentation request interface
 */
export interface SaveManualSegmentationRequest {
  name?: string;
  description?: string;
  frames?: SegmentationFrame[];
}

