// This is a type file for the test project page (/project(test)/[projectId])
// This file defines the types used in the project page

/**
 * This defines the type of loading currently being done on the project page.
 * It is used to manage the loading state of different components on the page.
 * Possible values:
 * - "idle": Awaiting next action but not considered complete.
 * - "project": Loading project data from the backend.
 * - "mask": Loading segmentation masks for the project from the backend.
 * - "job": Loading job data for the project from the backend.
 * - "done": All loading actions are complete and the page is ready to display content.
 */
export type LoadingStage = "idle" | "project" | "mask" | "job" | "done";

/**
 * Interface representing the structure of project data.
 * This is used to type the project data as fetched from the backend via the /get-project-data/projectId route.
 * 
 * @interface ProjectData
 * @property {string} projectId - Unique identifier for the project.
 * @property {string} name - Name of the project.
 * @property {string} description - Description of the project.
 * @property {boolean} isSaved - Indicates if the project is saved.
 * @property {number} filesize - Size of the project file in bytes.
 * @property {string} filetype - Type of the project file (e.g., 'vox', 'json').
 * @property {Object} [dimensions] - Optional dimensions of the project.
 * @property {number} dimensions.width - Width of the project.
 * @property {number} dimensions.height - Height of the project.
 * @property {number} [dimensions.slices] - Optional number of slices in the project.
 * @property {number} [dimensions.frames] - Optional number of frames in the project.
 * @property {Object} [voxelsize] - Optional voxel size information.
 * @property {number} voxelsize.x - X dimension of the voxel size.
 * @property {number} voxelsize.y - Y dimension of the voxel size.
 * @property {number} [voxelsize.z] - Optional Z dimension of the voxel size.
 * @property {number} [voxelsize.t] - Optional T dimension of the voxel size.
 * @property {string} [createdAt] - Optional creation date of the project in ISO format.
 * @property {string} [updatedAt] - Optional last updated date of the project in ISO format.
 */
export interface ProjectData {
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
 * Enum representing the possible classes for component bounding boxes in segmentation masks.
 * - RV: Right Ventricle
 * - MYO: Myocardium
 * - LVC: Left Ventricle Cavity
 * - MANUAL: Manual Bounding Box drawn by the user (only visible if user manually plots box)
 */
export enum ComponentBoundingBoxesClass {
    RV = "rv",
    MYO = "myo",
    LVC = "lvc",
    MANUAL = "manual",
}

/**
 * Interface representing a single component bounding box within a slice.
 * Used for identifying anatomical structures or manual annotations.
 * 
 * @interface ComponentBoundingBox
 * @property {ComponentBoundingBoxesClass} class - The class of the component (e.g., RV, MYO, LVC, MANUAL).
 * @property {number} confidence - Confidence score for the bounding box (0-1).
 * @property {number} x_min - Minimum X coordinate of the bounding box.
 * @property {number} y_min - Minimum Y coordinate of the bounding box.
 * @property {number} x_max - Maximum X coordinate of the bounding box.
 * @property {number} y_max - Maximum Y coordinate of the bounding box.
 */
export interface ComponentBoundingBox {
    class: ComponentBoundingBoxesClass;
    confidence: number;
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
}

/**
 * Interface representing the content of a segmentation mask for a single component.
 * 
 * @interface SegmentationMaskContent
 * @property {ComponentBoundingBoxesClass} class - The class of the segmented component.
 * @property {string} segmentationmaskcontents - RLE-encoded string representing the mask.
 */
export interface SegmentationMaskContent {
    class: ComponentBoundingBoxesClass;
    segmentationmaskcontents: string; // RLE encoded string
}

/**
 * Interface representing a single slice within a frame.
 * Contains bounding boxes and segmentation masks for that slice.
 * 
 * @interface SliceData
 * @property {number} sliceindex - Index of the slice within the frame.
 * @property {ComponentBoundingBox[]} [componentboundingboxes] - Optional array of bounding boxes for this slice.
 * @property {SegmentationMaskContent[]} [segmentationmasks] - Optional array of segmentation masks for this slice.
 */
export interface SliceData {
    sliceindex: number;
    componentboundingboxes?: ComponentBoundingBox[];
    segmentationmasks?: SegmentationMaskContent[];
}

/**
 * Interface representing a single frame in a segmentation mask.
 * Each frame contains multiple slices.
 * 
 * @interface FrameData
 * @property {number} frameindex - Index of the frame.
 * @property {boolean} frameinferred - Whether this frame was inferred/generated.
 * @property {SliceData[]} slices - Array of slice data for this frame.
 */
export interface FrameData {
    frameindex: number;
    frameinferred: boolean;
    slices: SliceData[];
}

/**
 * Base interface for segmentation masks, used by both MedSAM (AI-generated) and editable (manual) masks.
 * 
 * @interface BaseSegmentationMask
 * @property {string} _id - Unique identifier for the segmentation mask.
 * @property {string} projectid - ID of the project this mask belongs to.
 * @property {string} name - Name of the segmentation mask.
 * @property {string} [description] - Optional description of the mask.
 * @property {boolean} isSaved - Whether the mask is saved.
 * @property {boolean} segmentationmaskRLE - Whether the mask uses RLE encoding.
 * @property {boolean} isMedSAMOutput - True if generated by MedSAM, false if manually created.
 * @property {FrameData[]} frames - Array of frame data for the mask.
 */
export interface BaseSegmentationMask {
    _id: string;
    projectid: string;
    name: string;
    description?: string;
    isSaved: boolean;
    segmentationmaskRLE: boolean;
    isMedSAMOutput: boolean;
    frames: FrameData[];
}

/**
 * Interface for MedSAM (AI-generated) segmentation masks.
 * Extends BaseSegmentationMask with isMedSAMOutput set to true.
 * 
 * @interface MedSAMask
 * @extends BaseSegmentationMask
 * @property {true} isMedSAMOutput - Always true for MedSAM masks.
 */
export interface MedSamMask extends BaseSegmentationMask {
    isMedSAMOutput: true;
}

/**
 * Interface for editable (manual) segmentation masks.
 * Extends BaseSegmentationMask with isMedSAMOutput set to false.
 * 
 * @interface EditableMask
 * @extends BaseSegmentationMask
 * @property {false} isMedSAMOutput - Always false for editable masks.
 */
export interface EditableMask extends BaseSegmentationMask {
    isMedSAMOutput: false;
}

/**
 * Union type for segmentation masks returned from API responses.
 * Can be either a MedSAM (AI-generated) mask or an editable (manual) mask.
 * 
 * @typedef {MedSAMask | EditableMask} SegmentationMask
 */
export type SegmentationMask = MedSamMask | EditableMask;