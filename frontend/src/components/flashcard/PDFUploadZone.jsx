import React, { useState, useCallback } from 'react';
import { Upload, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import flashcardService from '../../services/flashcardService';

const PDFUploadZone = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await flashcardService.uploadMaterial(formData);
      toast.success('Course material uploaded successfully!');
      onUploadSuccess(result);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full border-2 border-dashed rounded-2xl transition-all duration-200 p-8 flex flex-col items-center justify-center gap-4 ${
        dragActive 
          ? 'border-indigo-500 bg-indigo-50/50' 
          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
      } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input
        type="file"
        id="pdf-upload"
        className="hidden"
        accept=".pdf"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />

      <div className={`p-4 rounded-full ${dragActive ? 'bg-indigo-100' : 'bg-white'} shadow-sm transition-colors`}>
        {uploading ? (
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        ) : (
          <Upload className={`w-8 h-8 ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
        )}
      </div>

      <div className="text-center">
        <label 
          htmlFor="pdf-upload" 
          className="text-lg font-medium text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors"
        >
          {uploading ? 'Uploading your course...' : 'Click to upload or drag and drop'}
        </label>
        <p className="text-sm text-slate-500 mt-1">
          Support for Course PDFs (Up to 10MB)
        </p>
      </div>

      {dragActive && (
        <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl flex items-center justify-center">
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
            Drop your PDF here
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploadZone;
