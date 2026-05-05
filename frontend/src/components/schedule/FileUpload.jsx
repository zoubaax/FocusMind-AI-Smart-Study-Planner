import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import scheduleService from '../../services/scheduleService';

const FileUpload = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or an Image (JPG, PNG)');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const data = await scheduleService.upload(file);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload schedule');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50/10 scale-[1.02]' 
            : 'border-white/20 bg-white/5 hover:bg-white/10'}
        `}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,image/*"
        />

        {!file ? (
          <>
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Upload your schedule</h3>
            <p className="text-gray-400 text-center text-sm">
              Drag and drop your PDF or Image here, or click to browse
            </p>
            <p className="mt-4 text-xs text-gray-500 italic">
              Supports: PDF, JPG, PNG (Max 10MB)
            </p>
          </>
        ) : (
          <div className="w-full flex items-center p-4 bg-white/5 rounded-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-3 bg-indigo-500/20 rounded-lg mr-4">
              <File className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            {!uploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-in shake-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {file && !uploading && (
        <button
          onClick={handleUpload}
          className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Confirm and Upload
        </button>
      )}

      {uploading && (
        <div className="mt-6 w-full py-4 bg-white/5 rounded-xl flex items-center justify-center gap-3 text-white border border-white/10">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          Uploading to cloud...
        </div>
      )}
    </div>
  );
};

export default FileUpload;
