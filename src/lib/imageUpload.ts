import { dataService } from './dataService';

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  imageId?: number;
  error?: string;
}

class ImageUploadService {
  private static instance: ImageUploadService;
  private currentUserId: number = 1; // Default admin user ID

  private constructor() {}

  public static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  public setCurrentUserId(userId: number) {
    this.currentUserId = userId;
  }

  /**
   * Upload image file using the data service
   */
  public async uploadImage(
    file: File,
    folder: string = 'uploads',
    description?: string
  ): Promise<ImageUploadResult> {
    try {
      console.log('🔄 Starting image upload process...');
      
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      console.log('📁 Uploading via data service...');

      // Upload using data service
      const result = await dataService.uploadImage(file, folder);
      
      if (result.success) {
        console.log('✅ Image uploaded successfully:', result.imageUrl);
      } else {
        console.error('❌ Upload failed:', result.error);
      }

      return result;
    } catch (error: any) {
      console.error('❌ Unexpected upload error:', error);
      return { success: false, error: `Unexpected error: ${error.message}` };
    }
  }

  /**
   * Delete image using the data service
   */
  public async deleteImage(imageId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting image:', imageId);
      
      const result = await dataService.deleteImage(imageId);
      
      if (result.success) {
        console.log('✅ Image deleted successfully');
      } else {
        console.error('❌ Delete failed:', result.error);
      }

      return result;
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      return { success: false, error: `Unexpected error: ${error.message}` };
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.' };
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }

    // Check filename
    if (!file.name || file.name.length > 255) {
      return { valid: false, error: 'Invalid filename.' };
    }

    return { valid: true };
  }
}

export const imageUploadService = ImageUploadService.getInstance();