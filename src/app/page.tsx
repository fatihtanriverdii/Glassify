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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-6xl">
        {/* Hero Section - Only show during face analysis step */}
        {step === Step.FACE_ANALYSIS && (
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-[#1e3a8a] mb-6">
              Mükemmel Gözlüğünüzü <span className="text-blue-600">Glassify</span> ile Bulun
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Yapay zeka destekli yüz analizi ile size en uygun gözlük modellerini keşfedin.
              Sadece bir fotoğraf ile başlayın.
            </p>
          </div>
        )}

        {/* Main Camera Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          {step === Step.FACE_ANALYSIS && (
            <>
              <h2 className="text-3xl font-bold text-[#1e3a8a] text-center mb-8">Yüz Şekli Analizi</h2>
              <div className="flex justify-center mb-8">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-4 sm:px-0">
                  <button
                    className={`px-4 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 ${
                      activeTab === 0 
                        ? 'bg-[#1e3a8a] text-white shadow-lg' 
                        : 'bg-[#93c5fd] text-[#1e3a8a] hover:bg-[#60a5fa]'
                    }`}
                    onClick={() => handleTabChange(null as any, 0)}
                    disabled={Number(step) === Step.GLASSES_TRY}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Kamera ile Çek
                    </div>
                  </button>
                  <button
                    className={`px-4 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 ${
                      activeTab === 1 
                        ? 'bg-[#1e3a8a] text-white shadow-lg' 
                        : 'bg-[#93c5fd] text-[#1e3a8a] hover:bg-[#60a5fa]'
                    }`}
                    onClick={() => handleTabChange(null as any, 1)}
                    disabled={Number(step) === Step.GLASSES_TRY}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Fotoğraf Yükle
                    </div>
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
              <div className="flex items-center mb-6">
                <button
                  className="px-4 py-2 rounded-lg bg-white text-[#1e3a8a] text-base font-semibold shadow-sm border border-[#1e3a8a] hover:bg-[#f8fafc] transition-colors flex items-center gap-2"
                  onClick={handleBack}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Geri
                </button>
              </div>
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
            </div>
          )}
        </div>

        {/* Features Grid and How It Works sections - Only show during face analysis step */}
        {step === Step.FACE_ANALYSIS && (
          <>
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-[#1e3a8a] mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Hassas Yüz Analizi</h3>
                <p className="text-gray-600">Yapay zeka teknolojimiz yüz şeklinizi analiz ederek size en uygun gözlük stilini belirler.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-[#1e3a8a] mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Kolay Kullanım</h3>
                <p className="text-gray-600">Fotoğraf yükleyin veya kameranızı kullanın - sadece birkaç saniye içinde sonuçları görün.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-[#1e3a8a] mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Kişiselleştirilmiş Öneriler</h3>
                <p className="text-gray-600">Size özel gözlük önerileri ile tarzınıza en uygun seçenekleri keşfedin.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-[#1e3a8a] mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Hızlı Sonuç</h3>
                <p className="text-gray-600">Saniyeler içinde yüz şeklinize uygun gözlük önerilerini alın.</p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-lg p-12 mb-16">
              <h2 className="text-3xl font-bold text-[#1e3a8a] text-center mb-12">Nasıl Çalışır?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Fotoğraf Çekin veya Yükleyin</h3>
                  <p className="text-gray-600">Kameranızı kullanın veya mevcut bir fotoğrafınızı yükleyin.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Yapay Zeka Analiz Eder</h3>
                  <p className="text-gray-600">Gelişmiş yapay zeka teknolojimiz yüz şeklinizi analiz eder.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Önerileri Görün</h3>
                  <p className="text-gray-600">Size özel gözlük önerilerini keşfedin ve deneyin.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 