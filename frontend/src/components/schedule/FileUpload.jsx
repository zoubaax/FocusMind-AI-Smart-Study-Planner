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
        className={`relative border-2 border-dashed rounded-[2rem] p-8 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
          ${isDragging 
            ? 'border-slate-900 bg-slate-50 scale-[1.02]' 
            : 'border-slate-200/60 bg-white hover:bg-slate-50'}
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
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Upload your schedule</h3>
            <p className="text-slate-500 text-center text-sm font-medium">
              Drag and drop your PDF or Image here, or click to browse
            </p>
            <p className="mt-4 text-xs text-slate-400 italic">
              Supports: PDF, JPG, PNG (Max 10MB)
            </p>
          </>
        ) : (
          <div className="w-full flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200/60 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-3 bg-slate-100 rounded-lg mr-4">
              <File className="w-6 h-6 text-slate-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            {!uploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200/60 rounded-lg text-red-600 text-sm font-medium animate-in shake-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {file && !uploading && (
        <button
          onClick={handleUpload}
          className="mt-6 w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xl shadow-slate-300 active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Confirm and Upload
        </button>
      )}

      {uploading && (
        <div className="mt-6 w-full py-4 bg-slate-50 rounded-xl flex items-center justify-center gap-3 text-slate-700 border border-slate-200/60 font-semibold">
          <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
          Uploading to cloud...
        </div>
      )}
    </div>
  );
};

export default FileUpload;
