import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/src/lib/utils';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUploader({
  onUpload,
  accept = '*',
  maxSize = 5242880, // 5MB default
  className,
}: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { 'application/octet-stream': [accept] } : undefined,
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
        isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? 'Suelta los archivos aquí'
            : 'Arrastra y suelta archivos aquí, o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Tamaño máximo: {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>
    </div>
  );
} 