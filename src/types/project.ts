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
 * SegmentationMask is the metadata for a segmentation mask associated with a project.
 */
export interface SegmentationMask {
  _id: string;
  projectId: string;
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
 