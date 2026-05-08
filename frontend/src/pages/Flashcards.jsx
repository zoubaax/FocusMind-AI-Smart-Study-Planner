import React, { useState, useEffect } from 'react';
import PDFUploadZone from '../components/flashcard/PDFUploadZone';
import FlashcardVault from '../components/flashcard/FlashcardVault';
import StudySession from '../components/flashcard/StudySession';
import flashcardService from '../services/flashcardService';
import { Loader2, BrainCircuit, Sparkles, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Flashcards = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [currentCards, setCurrentCards] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await flashcardService.getUserMaterials();
      setMaterials(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (id) => {
    setIsGenerating(true);
    const loadingToast = toast.loading('AI is analyzing your course and generating cards... (This may take up to 90s)');
    try {
      const cards = await flashcardService.generateFlashcards(id);
      toast.success(`Generated ${cards.length} flashcards!`, { id: loadingToast });
      // Reload if needed or just handle state
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate flashcards. Please try again.', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStudy = async (material) => {
    setLoading(true);
    try {
      const cards = await flashcardService.getFlashcardsByMaterial(material.id);
      if (cards.length === 0) {
        toast.error('No flashcards found. Click the sparkles icon to generate them first!');
        return;
      }
      setCurrentCards(cards);
      setSelectedMaterial(material);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-indigo-600" />
            AI Study Vault
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Upload course PDFs and let AI turn them into interactive flashcards.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
            showUpload 
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
          }`}
        >
          {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showUpload ? 'Cancel' : 'Upload Course Material'}
        </button>
      </div>

      {/* Upload Zone */}
      {showUpload && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <PDFUploadZone onUploadSuccess={(newMaterial) => {
            setMaterials([newMaterial, ...materials]);
            setShowUpload(false);
          }} />
        </div>
      )}

      {/* Stats/Info Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
            {materials.length}
          </div>
          <div>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Courses</p>
            <p className="text-slate-600 text-sm">Materials Uploaded</p>
          </div>
        </div>
        {/* You can add more stats here later */}
      </div>

      {/* Library Section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-semibold text-slate-900">Your Materials</h3>
          {isGenerating && (
            <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium animate-pulse">
              <Sparkles className="w-4 h-4" />
              AI Generating...
            </div>
          )}
        </div>

        {loading && !isGenerating ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-slate-400 mt-4 text-sm">Opening the vault...</p>
          </div>
        ) : (
          <FlashcardVault 
            materials={materials} 
            onSelect={handleStudy}
            onGenerate={handleGenerate}
            onDelete={() => {/* Delete logic */}}
          />
        )}
      </div>

      {/* Immersive Study Session Modal */}
      {selectedMaterial && (
        <StudySession 
          material={selectedMaterial}
          cards={currentCards}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </div>
  );
};

export default Flashcards;
