// Prints the project response from the backend
// Returns a single button that opens a sheet with project data

"use client";

// Sheet import
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Tab import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type definitions
import * as ProjectTypes from "@/types/project(test)";

export const ShowProjectData = ({ project, hasMasks }: { project: ProjectTypes.ProjectData; hasMasks: boolean }) => {
  if (!project) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="text-background bg-foreground" variant="ghost" size="sm">
          Project Information
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[800px] max-w-[900px] mt-16">
        <h1 className="text-center font-extrabold w-full text-foreground text-2xl">Project Information</h1>
        <Tabs className="w-full flex items-center justify-between" defaultValue="project">
          <TabsList className="flex flex-row w-2xl">
            <TabsTrigger value="project">Project Data</TabsTrigger>
            {hasMasks && <TabsTrigger value="mask">Mask Data</TabsTrigger>}
            <TabsTrigger value="job">Job Data</TabsTrigger>
          </TabsList>

          {/* Project Data Section */}
          <TabsContent value="project" className="p-4">
            <div>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
              galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It
              was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including
              versions of Lorem Ipsum.
            </div>
          </TabsContent>

          {/* Mask Data Section */}
          {hasMasks && <TabsContent value="mask"></TabsContent>}
          {/* Job Section */}
          <TabsContent value="job"></TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
    // <>
    //   <div className="bg-background text-foreground flex flex-col p-4 text-sm">
    //     <ul>
    //       <li>Project ID: {project.projectId}</li>
    //       <li>Project Name: {project.name}</li>
    //       <li>Description: {project.description}</li>
    //       <li>Is Saved: {project.isSaved ? "Yes" : "No"}</li>
    //       <li>File Size: {project.filesize} bytes</li>
    //       <li>File Type: {project.filetype}</li>
    //       {project.dimensions && (
    //         <li>
    //           Dimensions: {project.dimensions.width} × {project.dimensions.height}
    //           {project.dimensions.slices !== undefined && ` × ${project.dimensions.slices}`}
    //           {project.dimensions.frames !== undefined && ` × ${project.dimensions.frames}`}
    //         </li>
    //       )}
    //       {project.voxelsize && (
    //         <li>
    //           Voxel Size: x: {project.voxelsize.x}, y: {project.voxelsize.y}
    //           {project.voxelsize.z !== undefined && `, z: ${project.voxelsize.z}`}
    //           {project.voxelsize.t !== undefined && `, t: ${project.voxelsize.t}`}
    //         </li>
    //       )}
    //       {project.createdAt && <li>Created At: {project.createdAt}</li>}
    //       {project.updatedAt && <li>Updated At: {project.updatedAt}</li>}
    //     </ul>
    //   </div>
    // </>
  );
};
