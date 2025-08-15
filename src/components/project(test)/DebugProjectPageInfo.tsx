import * as ProjectTypes from "@/types/project(test)";

interface DebugProjectPageInfoProps {
  projectData: ProjectTypes.ProjectData;
}

// Simple debug component to display project data
export function DebugProjectPageInfo({ projectData }: DebugProjectPageInfoProps) {
  return (
    <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
      <div className="bg-primary px-4 py-2">
        <h4 className="text-sm font-medium text-primary-foreground flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Project Data
        </h4>
      </div>
      <div className="p-3">
        <div className="bg-muted rounded border border-border overflow-hidden">
          <pre className="p-3 text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
            {JSON.stringify(
              {
                name: projectData.name,
                description: projectData.description || null,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
