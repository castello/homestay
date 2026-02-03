'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  images: { url: string; file?: File }[];
  onChange: (images: { url: string; file?: File }[]) => void;
  maxFiles?: number;
  label?: string;
}

export function ImageUpload({ images, onChange, maxFiles = 30, label = '사진 업로드' }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file,
    }));
    onChange([...images, ...newImages].slice(0, maxFiles));
  }, [images, onChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: maxFiles - images.length,
  });

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-rose-400 bg-rose-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (최대 10MB)</p>
        <p className="text-xs text-gray-400">{images.length}/{maxFiles}장</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">대표</span>
              )}
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
