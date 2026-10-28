import { useCallback, useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X, Loader2, ImageIcon } from 'lucide-react';
import { useUpload } from '@/lib/useUpload';

interface FileUploadProps {
  bucket: 'public-assets' | 'private-files';
  pathPrefix: string;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  onUploaded: (urls: { url: string; path: string; filename: string }[]) => void;
  label?: string;
  currentFiles?: { url: string; filename: string }[];
  onRemove?: (index: number) => void;
}

interface UploadState {
  file: File;
  status: 'uploading' | 'done' | 'error';
  progress: number;
  result?: { url: string; path: string };
}

export function FileUpload({
  bucket,
  pathPrefix,
  accept,
  maxSizeMB = 20,
  multiple = false,
  onUploaded,
  label = 'Upload file',
  currentFiles = [],
  onRemove,
}: FileUploadProps) {
  const { upload } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList);
      const validFiles: File[] = [];
      const maxBytes = maxSizeMB * 1024 * 1024;

      for (const file of files) {
        if (file.size > maxBytes) {
          setUploads((prev) => [
            ...prev,
            { file, status: 'error', progress: 0 },
          ]);
          continue;
        }
        validFiles.push(file);
      }

      const newStates: UploadState[] = validFiles.map((file) => ({
        file,
        status: 'uploading',
        progress: 0,
      }));
      setUploads((prev) => [...prev, ...newStates]);

      const results: { url: string; path: string; filename: string }[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const result = await upload(file, bucket, pathPrefix);
        if (result) {
          setUploads((prev) =>
            prev.map((u, idx) => {
              const stateIdx = prev.length - validFiles.length + i;
              return idx === stateIdx
                ? { ...u, status: 'done', progress: 100, result }
                : u;
            })
          );
          results.push({ url: result.url, path: result.path, filename: file.name });
        } else {
          setUploads((prev) =>
            prev.map((u, idx) => {
              const stateIdx = prev.length - validFiles.length + i;
              return idx === stateIdx ? { ...u, status: 'error', progress: 0 } : u;
            })
          );
        }
      }

      if (results.length > 0) {
        onUploaded(results);
      }
    },
    [upload, bucket, pathPrefix, maxSizeMB, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const isImage = (filename: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename);
  };

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium text-navy-700">{label}</p>}

      {currentFiles.length > 0 && (
        <div className="space-y-2">
          {currentFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-navy-100 bg-navy-50/50 p-3"
            >
              {isImage(file.filename) ? (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="h-10 w-10 rounded object-cover flex-shrink-0"
                />
              ) : (
                <FileIcon className="h-5 w-5 text-navy-400 flex-shrink-0" />
              )}
              <span className="text-sm text-navy-700 flex-1 truncate">{file.filename}</span>
              {onRemove && (
                <button
                  onClick={() => onRemove(index)}
                  className="text-navy-400 hover:text-error-500"
                  type="button"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-all ${
          dragOver
            ? 'border-teal-400 bg-teal-50'
            : 'border-navy-200 hover:border-teal-300 hover:bg-navy-50/50'
        }`}
      >
        <UploadCloud className="h-8 w-8 text-navy-300" />
        <p className="text-sm text-navy-500">
          Drag and drop or <span className="text-teal-600 font-medium">browse</span>
        </p>
        <p className="text-xs text-navy-400">
          Max {maxSizeMB}MB {accept ? `· ${accept}` : ''}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((u, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-navy-100 bg-white p-3"
            >
              {isImage(u.file.name) ? (
                <ImageIcon className="h-5 w-5 text-navy-400 flex-shrink-0" />
              ) : (
                <FileIcon className="h-5 w-5 text-navy-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy-700 truncate">{u.file.name}</p>
                {u.status === 'uploading' && (
                  <div className="flex items-center gap-2 mt-1">
                    <Loader2 className="h-3 w-3 animate-spin text-teal-500" />
                    <span className="text-xs text-navy-400">Uploading...</span>
                  </div>
                )}
                {u.status === 'done' && (
                  <span className="text-xs text-success-600">Uploaded successfully</span>
                )}
                {u.status === 'error' && (
                  <span className="text-xs text-error-600">
                    Upload failed (file may be too large or type not allowed)
                  </span>
                )}
              </div>
              {u.status === 'done' && (
                <button
                  onClick={() => setUploads((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-navy-400 hover:text-error-500"
                  type="button"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
