import React, { useState } from 'react';
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

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setResults({}); // 초기화
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('mode', processingMode);

    console.log("📡 Uploading to:", import.meta.env.VITE_API_URL);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      console.log("📥 Status:", response.status);

      const text = await response.text();
      console.log("📥 Raw response:", text);

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status} - ${text}`);
      }

      const data = JSON.parse(text);

      if (processingMode === 'split' && data.segments.length === 0) {
        alert("No segments found");
        return;
      }

      setResults({
        original: data.original_url,
        processed: data.processed_url,
        bgRemoved: data.bg_removed_url,
        subtitled: data.subtitled_url,
        subtitleFile: data.subtitle_file_url,
        zipUrl: data.zip_url,
      });
    } catch (error) {
      alert('업로드 실패. 다시 시도해주세요.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">🎬 AICUT - AI 영상 편집기</h1>
      <VideoUploader onFileChange={handleFileSelect} />
      {selectedFile && (
        <>
          <VideoPlayer videoUrl={videoUrl} />
          <ProcessingOptions
            selectedMode={processingMode}
            onModeChange={setProcessingMode}
          />
          <button
            onClick={handleUpload}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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