import React, { useState, useEffect } from 'react';
import VideoUploader from './components/VideoUploader';
import VideoPlayer from './components/VideoPlayer';
import ProcessingOptions from './components/ProcessingOptions';
import ResultSection from './components/ResultSection';

const Home: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingMode, setProcessingMode] = useState<string>('remove');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [results, setResults] = useState<{
    original?: string;
    processed?: string;
    bgRemoved?: string;
    subtitled?: string;
    subtitleFile?: string;
    zipUrl?: string;
  }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setResults({});
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('mode', processingMode);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/process`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setResults({
          original: data.original_url,
          processed: data.processed_url,
          bgRemoved: data.bg_removed_url,
          subtitled: data.subtitled_url,
          subtitleFile: data.subtitle_file_url,
          zipUrl: data.zip_url,
        });
      } else {
        alert(`서버 오류: ${response.status}`);
      }
    } catch (error) {
      alert('업로드 실패. 다시 시도해주세요.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isProcessing && Object.keys(results).length > 0) {
      const el = document.getElementById("result-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">🎬 AICUT - AI 영상 편집기</h1>
      <VideoUploader onFileChange={handleFileSelect} />
      {selectedFile && (
        <>
          <VideoPlayer videoUrl={videoUrl} />
          <ProcessingOptions selectedMode={processingMode} onModeChange={setProcessingMode} />
          {isProcessing && (
            <p className="mt-4 text-blue-600 font-semibold animate-pulse">
              ⏳ 업로드 중... {uploadProgress}%
            </p>
          )}
          <button
            onClick={handleUpload}
            disabled={isProcessing}
            className={`mt-4 px-4 py-2 rounded text-white ${
              isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            영상 처리 시작
          </button>
        </>
      )}
      {processingMode === 'split' && results?.zipUrl && (
        <a href={results.zipUrl} download>
          <button>분할 영상 ZIP 다운로드</button>
        </a>
      )}
      <ResultSection results={results} />
    </div>
  );
};

export default Home;
