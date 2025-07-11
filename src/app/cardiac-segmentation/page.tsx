"use client";

import dynamic from 'next/dynamic';

const SegmentationTool = dynamic(
  () => import('@/components/segmentation-tool').then((mod) => mod.SegmentationTool),
  { ssr: false }
);

export default function SegmentationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h1 className="text-3xl font-bold mb-4 text-foreground">Manual Segmentation</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Use the brush to mark areas and the eraser to correct them on the image below.
      </p>
      {/* You can pass any image from your /public folder */}
      <SegmentationTool imageUrl="/image-1.png" width={800} height={600} />
    </div>
  );
}