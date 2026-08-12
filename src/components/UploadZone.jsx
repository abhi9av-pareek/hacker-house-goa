import React, { useCallback, useRef, useState } from 'react';

export default function UploadZone({ onFiles, multiple = false, label = 'DROP PHOTO HERE' }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files?.length) onFiles(files);
  }, [onFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleChange = useCallback((e) => {
    if (e.target.files?.length) onFiles(e.target.files);
    // Reset so same file can be re-uploaded
    e.target.value = '';
  }, [onFiles]);

  return (
    <label
      className={`upload-zone${isDragging ? ' dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragLeave}
      aria-label="Upload photo"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div className="upload-icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4L16 22M16 4L10 10M16 4L22 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 26H26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="upload-title">{label}</div>
      <div className="upload-sub">JPG · PNG · HEIC · AUTO-FIT · NO CROPPING</div>
    </label>
  );
}
