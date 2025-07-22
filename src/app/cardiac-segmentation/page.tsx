"use client";

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const SegmentationTool = dynamic(
  () => import('@/components/segmentation-tool').then((mod) => mod.SegmentationTool),
  { ssr: false }
);

export default function SegmentationPage() {
  return (
    <ProtectedRoute 
      allowedRoles={["user", "admin", "guest"]}
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg
                className="h-8 w-8 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Authentication Required
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please log in to access the cardiac segmentation tool.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Manual Segmentation</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Use the brush to mark areas and the eraser to correct them on the image below.
        </p>
        {/* You can pass any image from your /public folder */}
        <SegmentationTool imageUrl="/image-1.png" width={800} height={600} />
      </div>
    </ProtectedRoute>
  );
}