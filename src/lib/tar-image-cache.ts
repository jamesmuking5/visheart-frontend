// Type definitions for js-untar
interface UntarFile {
  name: string;
  buffer: ArrayBuffer;
}

/**
 * Tar Image Cache System with IndexedDB
 * Handles fetching, extracting, and caching MRI images from tar files
 */

// Install: npm install js-untar

export interface ImageCacheEntry {
  id: string;
  blob: Blob;
  filename: string;
  frameIndex: number;
  sliceIndex: number;
  timestamp: number;
  projectId: string;
}

export interface TarExtractionResult {
  success: boolean;
  totalImages: number;
  extractedImages: number;
  errors: string[];
  cacheSize: number;
}

export interface TarFetchDebugInfo {
  presignedUrlFetched: boolean;
  presignedUrl: string | null;
  presignedUrlExpiry: number | null;
  tarFileFetched: boolean;
  tarFileSize: number;
  extractionStarted: boolean;
  extractionCompleted: boolean;
  totalImagesFound: number;
  imagesStored: number;
  cacheErrors: string[];
  processingTime: number;
}

class TarImageCacheDB {
  private db: IDBDatabase | null = null;
  private dbName = 'visheart-image-cache';
  private version = 1;
  private storeName = 'images';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });

          // Create indexes for efficient querying
          store.createIndex('projectId', 'projectId', { unique: false });
          store.createIndex('frameIndex', 'frameIndex', { unique: false });
          store.createIndex('sliceIndex', 'sliceIndex', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async storeImage(entry: ImageCacheEntry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store image'));
    });
  }

  async getImage(id: string): Promise<ImageCacheEntry | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get image'));
    });
  }

  async getImagesByProject(projectId: string): Promise<ImageCacheEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('projectId');

      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error('Failed to get images by project'));
    });
  }

  async clearProject(projectId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const images = await this.getImagesByProject(projectId);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      let deleted = 0;
      const total = images.length;

      if (total === 0) {
        resolve();
        return;
      }

      images.forEach(image => {
        const deleteRequest = store.delete(image.id);
        deleteRequest.onsuccess = () => {
          deleted++;
          if (deleted === total) resolve();
        };
        deleteRequest.onerror = () => reject(new Error('Failed to delete image'));
      });
    });
  }

  async getCacheSize(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get cache size'));
    });
  }
}

// Utility functions for filename parsing
function extractIndicesFromFilename(filename: string): { frame: number; slice: number } {
  // Common patterns for medical imaging files:
  // slice_001_frame_000.jpg
  // frame_000_slice_001.dcm
  // img_f000_s001.png

  const patterns = [
    /slice_(\d+)_frame_(\d+)/i,
    /frame_(\d+)_slice_(\d+)/i,
    /s(\d+)_f(\d+)/i,
    /f(\d+)_s(\d+)/i,
    /_s(\d+)_f(\d+)/i,
    /_f(\d+)_s(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match) {
      if (pattern.source.includes('slice.*frame')) {
        return { slice: parseInt(match[1], 10), frame: parseInt(match[2], 10) };
      } else {
        return { frame: parseInt(match[1], 10), slice: parseInt(match[2], 10) };
      }
    }
  }

  // Fallback: try to extract any numbers
  const numbers = filename.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    return { frame: parseInt(numbers[0], 10), slice: parseInt(numbers[1], 10) };
  }

  // Last resort: use filename hash as indices
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return { frame: Math.abs(hash) % 100, slice: Math.abs(hash >> 16) % 100 };
}

export class TarImageCache {
  private db: TarImageCacheDB;
  private debugInfo: TarFetchDebugInfo = {
    presignedUrlFetched: false,
    presignedUrl: null,
    presignedUrlExpiry: null,
    tarFileFetched: false,
    tarFileSize: 0,
    extractionStarted: false,
    extractionCompleted: false,
    totalImagesFound: 0,
    imagesStored: 0,
    cacheErrors: [],
    processingTime: 0,
  };

  constructor() {
    this.db = new TarImageCacheDB();
    this.resetDebugInfo();
  }

  private resetDebugInfo(): void {
    this.debugInfo = {
      presignedUrlFetched: false,
      presignedUrl: null,
      presignedUrlExpiry: null,
      tarFileFetched: false,
      tarFileSize: 0,
      extractionStarted: false,
      extractionCompleted: false,
      totalImagesFound: 0,
      imagesStored: 0,
      cacheErrors: [],
      processingTime: 0,
    };
  }

  async init(): Promise<void> {
    await this.db.init();
  }

  getDebugInfo(): TarFetchDebugInfo {
    return { ...this.debugInfo };
  }

  async fetchAndExtractProjectImages(
    projectId: string,
    getPresignedUrl: (projectId: string) => Promise<{ success: boolean; presignedUrl?: string; expiresAt?: number; message?: string }>
  ): Promise<TarExtractionResult> {
    const startTime = performance.now();
    this.resetDebugInfo();

    try {
      // Step 1: Get presigned URL
      console.log(`[TarImageCache] Fetching presigned URL for project ${projectId}`);
      const presignedResponse = await getPresignedUrl(projectId);

      if (!presignedResponse.success || !presignedResponse.presignedUrl) {
        this.debugInfo.cacheErrors.push(`Failed to get presigned URL: ${presignedResponse.message || 'Unknown error'}`);
        return {
          success: false,
          totalImages: 0,
          extractedImages: 0,
          errors: this.debugInfo.cacheErrors,
          cacheSize: await this.db.getCacheSize(),
        };
      }

      this.debugInfo.presignedUrlFetched = true;
      this.debugInfo.presignedUrl = presignedResponse.presignedUrl;
      this.debugInfo.presignedUrlExpiry = presignedResponse.expiresAt || null;

      // Step 2: Fetch tar file
      console.log(`[TarImageCache] Fetching tar file from presigned URL`);
      const tarResponse = await fetch(presignedResponse.presignedUrl);

      if (!tarResponse.ok) {
        this.debugInfo.cacheErrors.push(`Failed to fetch tar file: ${tarResponse.status} ${tarResponse.statusText}`);
        return {
          success: false,
          totalImages: 0,
          extractedImages: 0,
          errors: this.debugInfo.cacheErrors,
          cacheSize: await this.db.getCacheSize(),
        };
      }

      const tarBlob = await tarResponse.blob();
      this.debugInfo.tarFileFetched = true;
      this.debugInfo.tarFileSize = tarBlob.size;

      // Step 3: Extract and store images
      console.log(`[TarImageCache] Extracting tar file (${tarBlob.size} bytes)`);
      const extractionResult = await this.extractAndStoreImages(projectId, tarBlob);

      this.debugInfo.processingTime = performance.now() - startTime;

      return extractionResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.debugInfo.cacheErrors.push(`Extraction failed: ${errorMessage}`);
      this.debugInfo.processingTime = performance.now() - startTime;

      return {
        success: false,
        totalImages: 0,
        extractedImages: 0,
        errors: this.debugInfo.cacheErrors,
        cacheSize: await this.db.getCacheSize(),
      };
    }
  }

  private async extractAndStoreImages(projectId: string, tarBlob: Blob): Promise<TarExtractionResult> {
    this.debugInfo.extractionStarted = true;

    try {
      // Clear existing images for this project
      await this.db.clearProject(projectId);

      // Convert blob to array buffer for js-untar
      const arrayBuffer = await tarBlob.arrayBuffer();

      // Dynamic import of js-untar v2.0.0
      console.log(`[TarImageCache] Attempting to import js-untar...`);
      const untarModule = await import('js-untar');
      console.log(`[TarImageCache] js-untar module:`, untarModule);

      // js-untar v2.0.0 exports untar as the default export
      const untar = untarModule.default || untarModule.untar || untarModule;
      console.log(`[TarImageCache] untar function:`, typeof untar);

      if (typeof untar !== 'function') {
        throw new Error(`js-untar did not export a function. Got: ${typeof untar}. Available exports: ${Object.keys(untarModule).join(', ')}`);
      }

      console.log(`[TarImageCache] Calling untar with ${arrayBuffer.byteLength} bytes...`);
      const files = await untar(arrayBuffer);
      console.log(`[TarImageCache] Extracted ${files.length} files from tar`);

      // Filter image files
      const imageFiles = files.filter((file: UntarFile) => {
        const filename = file.name.toLowerCase();
        return filename.match(/\.(jpg|jpeg|png|bmp|tiff|tif|dcm|dicom)$/i) && !filename.includes('__MACOSX');
      });

      this.debugInfo.totalImagesFound = imageFiles.length;
      console.log(`[TarImageCache] Found ${imageFiles.length} image files`);

      let storedCount = 0;
      const errors: string[] = [];

      // Process each image file
      for (const file of imageFiles) {
        try {
          const { frame, slice } = extractIndicesFromFilename(file.name);
          const imageId = `${projectId}_f${frame}_s${slice}`;

          const blob = new Blob([file.buffer], {
            type: this.getMimeType(file.name)
          });

          const entry: ImageCacheEntry = {
            id: imageId,
            blob,
            filename: file.name,
            frameIndex: frame,
            sliceIndex: slice,
            timestamp: Date.now(),
            projectId,
          };

          await this.db.storeImage(entry);
          storedCount++;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to store ${file.name}: ${errorMessage}`);
        }
      }

      this.debugInfo.imagesStored = storedCount;
      this.debugInfo.extractionCompleted = true;
      this.debugInfo.cacheErrors.push(...errors);

      const cacheSize = await this.db.getCacheSize();

      console.log(`[TarImageCache] Successfully stored ${storedCount}/${imageFiles.length} images`);

      return {
        success: storedCount > 0,
        totalImages: imageFiles.length,
        extractedImages: storedCount,
        errors,
        cacheSize,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TarImageCache] Extraction failed:`, error);
      this.debugInfo.cacheErrors.push(`Extraction error: ${errorMessage}`);

      return {
        success: false,
        totalImages: 0,
        extractedImages: 0,
        errors: [errorMessage],
        cacheSize: await this.db.getCacheSize(),
      };
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff',
      'tif': 'image/tiff',
      'dcm': 'application/dicom',
      'dicom': 'application/dicom',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  async getImageBlob(projectId: string, frame: number, slice: number): Promise<Blob | null> {
    const imageId = `${projectId}_f${frame}_s${slice}`;
    const entry = await this.db.getImage(imageId);
    return entry?.blob || null;
  }

  async getImageURL(projectId: string, frame: number, slice: number): Promise<string | null> {
    const blob = await this.getImageBlob(projectId, frame, slice);
    return blob ? URL.createObjectURL(blob) : null;
  }

  async getAvailableFramesAndSlices(projectId: string): Promise<{ frames: number[]; slices: number[] }> {
    const images = await this.db.getImagesByProject(projectId);
    const frames = [...new Set(images.map(img => img.frameIndex))].sort((a, b) => a - b);
    const slices = [...new Set(images.map(img => img.sliceIndex))].sort((a, b) => a - b);
    return { frames, slices };
  }

  async clearProjectCache(projectId: string): Promise<void> {
    await this.db.clearProject(projectId);
  }

  async getCacheSize(): Promise<number> {
    return await this.db.getCacheSize();
  }
}

// Export singleton instance
export const tarImageCache = new TarImageCache();
