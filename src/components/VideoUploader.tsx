import React, { useRef } from 'react';

type VideoUploaderProps = {
  onFileSelect: (file: File) => void;
};

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) {
        alert('100MB 이하의 영상만 업로드 가능합니다.');
        return;
      }
      onFileSelect(file);
    } else {
      alert('영상 파일을 선택해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center p-4 border border-gray-300 rounded-lg">
      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        영상 업로드하기
      </button>
    </div>
  );
};

export default VideoUploader;