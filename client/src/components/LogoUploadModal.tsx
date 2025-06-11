import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (logoUrl: string) => void;
  entityName: string;
  entityType: 'partner' | 'customer';
}

export default function LogoUploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  entityName, 
  entityType 
}: LogoUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const ACCEPTED_FORMATS = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Compress and resize image to fit placeholder dimensions (64x64)
  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas size to placeholder dimensions
        const size = 64;
        canvas.width = size;
        canvas.height = size;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate dimensions to maintain aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;
        let offsetX = 0;
        let offsetY = 0;

        if (aspectRatio > 1) {
          // Landscape image
          drawHeight = size / aspectRatio;
          offsetY = (size - drawHeight) / 2;
        } else {
          // Portrait or square image
          drawWidth = size * aspectRatio;
          offsetX = (size - drawWidth) / 2;
        }

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Draw the image
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Convert to base64 with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return `Please select a valid image file (PNG, JPG, JPEG, WebP, or SVG)`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 5MB`;
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({
        title: "Invalid file",
        description: error,
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Compress image
      const compressedImage = await compressImage(file);
      
      // Here you would normally upload to your server
      // For now, we'll simulate an upload and store locally
      const logoUrl = compressedImage;
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onUpload(logoUrl);
      
      toast({
        title: "Logo uploaded successfully",
        description: `${entityName} logo has been updated.`,
      });

      handleClose();
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Upload failed",
        description: "There was an error processing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setUploading(false);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5" />
            <span>Upload {entityType} logo</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Upload a logo for <span className="font-medium">{entityName}</span>
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FORMATS.join(',')}
              onChange={handleInputChange}
              className="hidden"
            />

            {preview ? (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden border">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600">Preview</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Drop your logo here, or{' '}
                    <button
                      type="button"
                      onClick={openFileDialog}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG, WebP, SVG up to 5MB
                  </p>
                </div>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Processing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={openFileDialog} 
              disabled={uploading}
              className="bg-[#5567E5] hover:bg-[#3E4DC4]"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}