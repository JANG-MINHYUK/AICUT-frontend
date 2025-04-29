import React, { useState } from 'react';
import VideoUploader from './VideoUploader';
import VideoPlayer from './VideoPlayer';
import ProcessingOptions from './ProcessingOptions';
import ResultSection from './ResultSection';

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

    try {
      const response = await fetch('https://ai-video-editor.onrender.com/process', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults({
        original: data.original_url,
        processed: data.processed_url,
        bgRemoved: data.bg_removed_url,
        subtitled: data.subtitled_url,
        subtitleFile: data.subtitle_file_url,
      });
    } catch (error) {
      alert('업로드 실패. 다시 시도해주세요.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">🎬 AICUT - AI 영상 편집기</h1>
      <VideoUploader onFileSelect={handleFileSelect} />
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
      <ResultSection results={results} />
    </div>
  );
};

export default Home;