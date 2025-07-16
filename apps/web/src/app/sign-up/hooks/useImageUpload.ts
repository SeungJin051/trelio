'use client';

import { useRef, useState } from 'react';

import { useToast } from '@/hooks/useToast';

interface UseImageUploadOptions {
  maxSize?: number;
  allowedTypes?: readonly string[];
  cropSize?: number;
  jpegQuality?: number;
  onImageCropped?: (croppedImage: string) => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/'],
    cropSize = 300,
    jpegQuality = 0.9,
    onImageCropped,
  } = options;

  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toast = useToast();

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    const isValidType = allowedTypes.some((type) => file.type.startsWith(type));
    if (!isValidType) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 검증
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      toast.error(`파일 크기는 ${sizeMB}MB 이하여야 합니다.`);
      return;
    }

    setIsProcessing(true);

    // 파일을 base64로 변환하여 즉시 크롭
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      cropImageAutomatically(imageUrl);
    };
    reader.onerror = () => {
      toast.error('파일을 읽는 중 오류가 발생했습니다.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  // 자동 크롭 기능
  const cropImageAutomatically = (imageUrl: string) => {
    if (!canvasRef.current) {
      setIsProcessing(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        // 정사각형 크롭을 위한 크기 계산
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        // 캔버스 크기 설정
        canvas.width = cropSize;
        canvas.height = cropSize;

        // 이미지를 캔버스에 그리기
        ctx.drawImage(
          img,
          startX,
          startY,
          size,
          size, // 소스 영역
          0,
          0,
          cropSize,
          cropSize // 대상 영역
        );

        // 크롭된 이미지를 base64로 변환
        const croppedDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
        setCroppedImage(croppedDataUrl);

        // 콜백 함수 호출
        onImageCropped?.(croppedDataUrl);

        toast.success('프로필 사진이 설정되었습니다.');
      } catch (error) {
        console.error('이미지 크롭 중 오류:', error);
        toast.error('이미지 처리 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      toast.error('이미지를 로드할 수 없습니다.');
      setIsProcessing(false);
    };

    img.src = imageUrl;
  };

  // 파일 업로드 버튼 클릭 핸들러
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // 크롭된 이미지 초기화
  const resetImage = () => {
    setCroppedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    // 상태
    croppedImage,
    isProcessing,

    // refs
    fileInputRef,
    canvasRef,

    // 핸들러
    handleFileSelect,
    triggerFileUpload,
    resetImage,
  };
};
