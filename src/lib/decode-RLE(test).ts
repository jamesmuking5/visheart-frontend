/**
 * RLE (Run-Length Encoding) utilities for segmentation masks
 * Compatible with the format used by the VisHeart GPU inference server
 * Based on the Python script: app/scripts/_decode_rle.py
 */

/**
 * Decodes a Run-Length Encoded string into a binary mask array
 * 
 * @param rleString - Space-separated RLE string (e.g., "100 5 200 3")
 * @param height - Height of the output mask
 * @param width - Width of the output mask
 * @returns Uint8Array representing the binary mask (0s and 1s)
 */
export function rleDecodeToArray(
  rleString: string,
  height: number,
  width: number,
): Uint8Array {
  if (!rleString || typeof rleString !== "string") {
    return new Uint8Array(height * width);
  }

  const runs = rleString
    .split(" ")
    .map((x) => parseInt(x, 10))
    .filter((x) => !isNaN(x));
  const size = height * width;
  const mask = new Uint8Array(size);

  // The encoding alternates between run-starts and run-lengths
  // runs[0] = start position, runs[1] = length, runs[2] = next start, runs[3] = next length, etc.
  for (let i = 0; i < runs.length; i += 2) {
    const startIdx = runs[i];
    const runLength = runs[i + 1];

    if (
      startIdx !== undefined &&
      runLength !== undefined &&
      startIdx < size
    ) {
      const endIdx = Math.min(startIdx + runLength, size);
      for (let j = startIdx; j < endIdx; j++) {
        mask[j] = 1;
      }
    }
  }

  return mask;
}

/**
 * Interface for decoded masks result
 */
export interface DecodedMasks {
  masks: Record<string, Uint8Array>;
}

/**
 * Interface for project dimensions
 */
export interface ProjectDimensions {
  width: number;
  height: number;
}

/**
 * Function to decode all RLE masks from segmentation data
 * 
 * @param masks - Array of all segmentation masks to decode
 * @param projectDimensions - Project dimensions (width and height)
 * @returns DecodedMasks object containing all decoded masks
 */
import * as ProjectTypes from "@/types/project(test)";

export function decodeSegmentationMasks(
  masks: ProjectTypes.BaseSegmentationMask[],
  projectDimensions: ProjectDimensions,
): DecodedMasks {
  const decodedMasks: Record<string, Uint8Array> = {};

  const { width, height } = projectDimensions;

  // Decode masks
  masks.forEach((maskData, maskIndex) => {
    if (maskData.frames) {
      maskData.frames.forEach((frame: ProjectTypes.FrameData, frameIndex: number) => {
        if (frame.slices) {
          frame.slices.forEach((slice: ProjectTypes.SliceData, sliceIndex: number) => {
            if (slice.segmentationmasks) {
              slice.segmentationmasks.forEach((mask: ProjectTypes.SegmentationMaskContent) => {
                // Example name: "medSam_mask_0_frame_0_slice_0_class1"
                const maskType = maskData.isMedSAMOutput ? "medSamOutput" : "editable";
                const maskKey = `${maskType}_mask_${maskIndex}_frame_${frameIndex}_slice_${sliceIndex}_${mask.class}`;
                const decodedMask = rleDecodeToArray(
                  mask.segmentationmaskcontents,
                  height,
                  width,
                );
                decodedMasks[maskKey] = decodedMask;
              });
            }
          });
        }
      });
    }
  });

  console.log(`Decoded ${Object.keys(decodedMasks).length} total masks`);

  return {
    masks: decodedMasks,
  };
}

/**
 * Utility function to get mask statistics
 * 
 * @param mask - Uint8Array mask
 * @returns Object with mask statistics
 */
export function getMaskStats(mask: Uint8Array) {
  const totalPixels = mask.length;
  const nonZeroPixels = mask.filter((v) => v > 0).length;
  const coverage = nonZeroPixels / totalPixels;

  return {
    totalPixels,
    nonZeroPixels,
    coverage,
  };
}

/**
 * Utility function to convert mask to ImageData for canvas rendering
 * 
 * @param mask - Uint8Array mask
 * @param width - Width of the mask
 * @param height - Height of the mask
 * @param color - RGBA color for the mask [r, g, b, a] (default: semi-transparent red)
 * @returns Uint8ClampedArray suitable for ImageData constructor
 */
export function maskToImageData(
  mask: Uint8Array,
  width: number,
  height: number,
  color: [number, number, number, number] = [255, 0, 0, 128],
): Uint8ClampedArray {
  const imageData = new Uint8ClampedArray(width * height * 4);
  const [r, g, b, a] = color;

  for (let i = 0; i < mask.length; i++) {
    const pixelIndex = i * 4;
    if (mask[i] === 1) {
      imageData[pixelIndex] = r;     // Red
      imageData[pixelIndex + 1] = g; // Green
      imageData[pixelIndex + 2] = b; // Blue
      imageData[pixelIndex + 3] = a; // Alpha
    }
    // Transparent pixels are already 0 from Uint8ClampedArray initialization
  }

  return imageData;
}
