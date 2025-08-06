// This is a type file for the test project page (/project(test)/[projectId])
// This file defines the types used in the project page

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