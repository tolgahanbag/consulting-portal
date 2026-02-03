"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export function FileUpload({
  onFileSelect,
  accept = ".pdf,.jpg,.jpeg,.png,.docx",
  maxSizeMB = 10,
  label,
}: FileUploadProps) {
  const t = useTranslations("admin");
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) return;
      setFileName(file.name);
      onFileSelect(file);
    },
    [maxSizeMB, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-navy-500 mb-1">{label}</label>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? "border-gold-500 bg-gold-50/30"
            : "border-navy-200 hover:border-gold-400 bg-white/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <svg
          className="w-8 h-8 mx-auto mb-2 text-navy-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {fileName ? (
          <p className="text-sm text-navy-700 font-medium">
            {t("fileUpload.selectedFile")}: {fileName}
          </p>
        ) : (
          <>
            <p className="text-sm text-navy-500">{t("fileUpload.dragDrop")}</p>
            <p className="text-xs text-navy-300 mt-1">
              {t("fileUpload.maxSize", { size: maxSizeMB })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
