// Image export types

export type ImageFormat = 'square' | 'story' | 'twitter';

export interface ImageDimensions {
  width: number;
  height: number;
}

export const IMAGE_FORMATS: Record<ImageFormat, ImageDimensions> = {
  square: { width: 1080, height: 1080 },   // Instagram Post
  story: { width: 1080, height: 1920 },    // Instagram Story
  twitter: { width: 1200, height: 675 },   // Twitter Card
};

export interface ExportConfig {
  format: ImageFormat;
  scale: number;
  quality: number;
}
