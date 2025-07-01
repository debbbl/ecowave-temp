import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { UploadIcon, ImageIcon, XIcon } from 'lucide-react';

interface ImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = "Image",
  value,
  onChange,
  placeholder = "Enter image URL or upload an image",
  maxSize = 5,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // For now, we'll use a placeholder URL since Supabase storage might not be configured
      // In a real implementation, you would upload to Supabase storage here
      
      // Create a local URL for preview (this won't persist)
      const localUrl = URL.createObjectURL(file);
      
      // For demo purposes, we'll use a placeholder image URL
      const placeholderUrl = `https://images.pexels.com/photos/3952241/pexels-photo-3952241.jpeg?auto=compress&cs=tinysrgb&w=800`;
      
      onChange(placeholderUrl);
      
      // Clean up the local URL
      setTimeout(() => URL.revokeObjectURL(localUrl), 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setUploadError(null);
    onChange(url);
  };

  const clearImage = () => {
    onChange('');
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">{label}</Label>
      
      {/* URL Input */}
      <div className="space-y-2">
        <Input
          id="image-upload"
          type="url"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isUploading}
        />
        
        {/* File Upload */}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={disabled || isUploading}
            className="hidden"
            id="file-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={disabled || isUploading}
            className="flex items-center space-x-2"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <UploadIcon className="h-4 w-4" />
            )}
            <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
          </Button>
          
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearImage}
              disabled={disabled || isUploading}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}

      {/* Image Preview */}
      {value && (
        <div className="mt-2">
          <div className="relative w-full h-32 border border-gray-300 rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setUploadError('Invalid image URL')}
            />
            <div className="absolute top-2 right-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={clearImage}
                disabled={disabled}
                className="h-6 w-6 p-0"
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        You can either enter an image URL or upload an image file (max {maxSize}MB)
      </p>
    </div>
  );
};