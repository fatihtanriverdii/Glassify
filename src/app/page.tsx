'use client';

import { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import CameraCapture from '@/components/Camera/cameraCapture';
import PhotoUpload from '@/components/Photo/photoUpload';
import { FaceAnalysis } from '@/components/FaceAnalysis';

interface AnalysisResult {
  shape: string;
  confidence: number;
  probabilities: Record<string, number>;
}

interface FaceAnalysisResult {
  faceType: string;
  confidence: number;
  otherProbabilities: {
    [key: string]: number;
  };
}

enum Step {
  FACE_ANALYSIS = 1,
  GLASSES_TRY = 2
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<FaceAnalysisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(Step.FACE_ANALYSIS);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setAnalysisResult(null);
    setCapturedImage(null);
    setStep(Step.FACE_ANALYSIS);
  };

  const handleAnalysisComplete = (result: AnalysisResult | null, image: string | null) => {
    if (result) {
      setAnalysisResult({
        faceType: result.shape,
        confidence: result.confidence,
        otherProbabilities: result.probabilities
      });
      setStep(Step.GLASSES_TRY);
    } else {
      setAnalysisResult(null);
    }
    if (image) {
      setCapturedImage(image);
    }
  };

  const handleBack = () => {
    setStep(Step.FACE_ANALYSIS);
    setAnalysisResult(null);
    setCapturedImage(null);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          {step === Step.FACE_ANALYSIS && (
            <>
              <h1 className="text-4xl font-bold text-[#1e3a8a] text-center mb-4">Yüz Şekli Analizi</h1>
              <div className="flex justify-center mb-6">
                <div className="flex gap-3">
                  <button
                    className={`px-5 py-2.5 rounded-lg text-lg font-semibold transition-colors ${activeTab === 0 ? 'bg-[#1e3a8a] text-white' : 'bg-[#93c5fd] text-[#1e3a8a]'} `}
                    onClick={() => handleTabChange(null as any, 0)}
                    // @ts-ignore
                    disabled={step === 2}
                  >
                    Kamera ile Çek
                  </button>
                  <button
                    className={`px-5 py-2.5 rounded-lg text-lg font-semibold transition-colors ${activeTab === 1 ? 'bg-[#1e3a8a] text-white' : 'bg-[#93c5fd] text-[#1e3a8a]'} `}
                    onClick={() => handleTabChange(null as any, 1)}
                    // @ts-ignore
                    disabled={step === 2}
                  >
                    Fotoğraf Yükle
                  </button>
                </div>
              </div>
            </>
          )}

          {step === Step.FACE_ANALYSIS && (
            <div>
              {activeTab === 0 ? (
                <CameraCapture onAnalysisComplete={handleAnalysisComplete} />
              ) : (
                <PhotoUpload onAnalysisComplete={handleAnalysisComplete} />
              )}
            </div>
          )}

          {step === Step.GLASSES_TRY && analysisResult && capturedImage && (
            <div>
              <div className="mb-6">
                <div className="flex flex-col items-center text-center">
                  <span className="text-xl font-semibold text-[#111827]">Yüz Şekli: {analysisResult.faceType}</span>
                  <span className="text-lg text-gray-500">Güven Skoru: %{Math.min(100, (analysisResult.confidence)).toFixed(0)}</span>
                </div>
              </div>
              <FaceAnalysis
                analysisResult={analysisResult}
                capturedImage={capturedImage}
              />
              <div className="flex justify-center mt-8">
                <button
                  className="px-8 py-3 rounded-lg bg-[#1e3a8a] text-white text-lg font-semibold shadow hover:bg-[#2541a6] transition-colors"
                  onClick={handleBack}
                >
                  &larr; Geri
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 