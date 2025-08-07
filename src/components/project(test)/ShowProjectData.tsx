// Prints the project response from the backend

"use client";

// Type definitions
import * as ProjectTypes from "@/types/project(test)";

export const ShowProjectData = ({
  project,
}: {
  project: ProjectTypes.ProjectData;
}) => {
  if (!project) return null;

  return (
    <>
      <div className="bg-background text-foreground flex flex-col p-4 text-sm">
        <ul>
          <li>Project ID: {project.projectId}</li>
          <li>Project Name: {project.name}</li>
          <li>Description: {project.description}</li>
          <li>Is Saved: {project.isSaved ? "Yes" : "No"}</li>
          <li>File Size: {project.filesize} bytes</li>
          <li>File Type: {project.filetype}</li>
          {project.dimensions && (
            <li>
              Dimensions: {project.dimensions.width} ×{" "}
              {project.dimensions.height}
              {project.dimensions.slices !== undefined &&
                ` × ${project.dimensions.slices}`}
              {project.dimensions.frames !== undefined &&
                ` × ${project.dimensions.frames}`}
            </li>
          )}
          {project.voxelsize && (
            <li>
              Voxel Size: x: {project.voxelsize.x}, y: {project.voxelsize.y}
              {project.voxelsize.z !== undefined &&
                `, z: ${project.voxelsize.z}`}
              {project.voxelsize.t !== undefined &&
                `, t: ${project.voxelsize.t}`}
            </li>
          )}
          {project.createdAt && <li>Created At: {project.createdAt}</li>}
          {project.updatedAt && <li>Updated At: {project.updatedAt}</li>}
        </ul>
      </div>
    </>
  );
};
