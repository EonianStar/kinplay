'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import DefaultAvatar from '../icons/DefaultAvatar';
import Cropper from 'react-easy-crop';

// 工具函数：canvas裁剪图片
async function getCroppedImg(imageSrc: string, crop: any) {
  const image = new window.Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}

// 只在浏览器环境下引入 cos-js-sdk-v5，避免 Node.js 环境警告
let cos: any = null;
if (typeof window !== 'undefined') {
  // @ts-ignore
  const COS = require('cos-js-sdk-v5');
  cos = new COS({
    SecretId: process.env.NEXT_PUBLIC_TENCENT_COS_SECRET_ID!,
    SecretKey: process.env.NEXT_PUBLIC_TENCENT_COS_SECRET_KEY!,
  });
}

const avatarList = [
  'https://img.kinplay.fun/default/FluffyAvatar.png',
  'https://img.kinplay.fun/default/CocoAvatar.png',
  'https://img.kinplay.fun/default/SparkyAvatar.png',
  'https://img.kinplay.fun/default/GarfatAvatar.png',
  'https://img.kinplay.fun/default/UnderbiteAvatar.png',
  'https://img.kinplay.fun/default/CurtisAvatar.png',
  'https://img.kinplay.fun/default/CarrotAvatar.png',
  'https://img.kinplay.fun/default/HammerAvatar.png',
  'https://img.kinplay.fun/default/BaconAvatar.png',
  'https://img.kinplay.fun/default/BarbieAvatar.png',
  'https://img.kinplay.fun/default/LouAvatar.png',
  'https://img.kinplay.fun/default/MacchiatoAvatar.png',
  'https://img.kinplay.fun/default/BruceAvatar.png',
  'https://img.kinplay.fun/default/TiagraAvatar.png',
  'https://img.kinplay.fun/default/HarryAvatar.png',
  'https://img.kinplay.fun/default/OttaAvatar.png',
  'https://img.kinplay.fun/default/NemoAvatar.png',
  'https://img.kinplay.fun/default/MorseAvatar.png',
  'https://img.kinplay.fun/default/ValienteAvatar.png',
  'https://img.kinplay.fun/default/MoonmoonAvatar.png',
];

export default function AvatarUpload() {
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user?.user_metadata?.avatar_url || null);
  const [customCropped, setCustomCropped] = useState<string | null>(null);

  // 新增：根据屏幕宽度动态设置裁剪框尺寸
  const getCropperSize = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 600
        ? window.innerWidth - 32
        : 480;
    }
    return 480;
  };
  const [cropperSize, setCropperSize] = useState(480);

  useEffect(() => {
    setSelectedAvatar(user?.user_metadata?.avatar_url || null);
  }, [user]);

  useEffect(() => {
    const updateSize = () => setCropperSize(getCropperSize());
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 选图后默认展示图片中心
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('只支持 JPG/JPEG/PNG 格式图片');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('图片不能超过 5MB');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
      setCrop({ x: 0, y: 0 }); // 居中
      setZoom(1); // 默认缩放
    };
    reader.readAsDataURL(file);
  };

  // 裁剪完成
  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 上传自定义头像时，判断 cos 是否可用
  const handleCustomUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !cos) return;
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fileName = `avatars/${user?.id}_${Date.now()}.png`;
      cos.putObject(
        {
          Bucket: process.env.NEXT_PUBLIC_TENCENT_COS_BUCKET!,
          Region: process.env.NEXT_PUBLIC_TENCENT_COS_REGION!,
          Key: fileName,
          Body: croppedBlob,
        },
        async (err: any, data: any) => {
          setUploading(false);
          if (err) {
            setError('上传失败: ' + (err.message || JSON.stringify(err)));
            console.error('COS上传错误:', err);
          } else {
            const url = `https://img.kinplay.fun/${fileName}`;
            await updateUserProfile({ photoURL: url });
            setSuccessMessage('头像更新成功');
            setShowCropper(false);
            setImageSrc(null);
            setCustomCropped(url);
            setSelectedAvatar(url);
            window.location.reload();
          }
        }
      );
    } catch (e) {
      setUploading(false);
      setError('裁剪或上传失败');
    }
  };

  // 确认提交
  const handleConfirm = async () => {
    if (!selectedAvatar) return;
    await updateUserProfile({ photoURL: selectedAvatar });
    setSuccessMessage('头像更新成功');
    setShowDialog(false);
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20 rounded-full ring-2 ring-white shadow-[0_0_15px_rgba(0,0,0,0.3)]">
          {user?.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="User avatar"
              className="rounded-full object-cover"
              fill
              sizes="80px"
            />
          ) : (
            <DefaultAvatar className="w-20 h-20" />
          )}
        </div>
        <div className="flex flex-row gap-4">
          <button
            type="button"
            onClick={() => setShowDialog(true)}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-900 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            设置头像
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>
      {/* 头像设置弹窗 */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center min-w-[320px] max-w-[95vw] w-[400px] relative">
            {/* 关闭按钮 */}
            <button
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowDialog(false)}
              aria-label="关闭"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">设置头像</h2>
            {/* 预设头像区 */}
            <div className="w-full flex flex-wrap justify-center gap-2 mb-4 max-h-48 overflow-y-auto">
              {avatarList.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="预设头像"
                  className={`w-14 h-14 rounded-full cursor-pointer border-4 ${selectedAvatar === url ? 'border-blue-500' : 'border-transparent'}`}
                  onClick={() => setSelectedAvatar(url)}
                />
              ))}
            </div>
            {/* 自定义上传区 */}
            <div className="w-full flex flex-col items-center mt-2 mb-4">
              <button
                className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border-4 border-dashed border-gray-300 hover:bg-gray-200 focus:outline-none"
                onClick={() => {
                  setShowDialog(false);
                  fileInputRef.current?.click();
                }}
                aria-label="自定义头像"
              >
                <DefaultAvatar className="w-10 h-10" />
              </button>
              {customCropped && (
                <img src={customCropped} alt="自定义头像" className="w-14 h-14 rounded-full mt-2 border-4 border-blue-400" />
              )}
            </div>
            {/* 确认按钮 */}
            <div className="w-full flex justify-end mt-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleConfirm}
                disabled={!selectedAvatar}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 裁剪弹窗 */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div
              className="relative bg-gray-100"
              style={{
                width: cropperSize,
                height: cropperSize,
                maxWidth: '95vw',
                maxHeight: '95vw',
              }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
                restrictPosition={true}
                minZoom={1}
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleCustomUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {uploading ? '上传中...' : '确定'}
              </button>
              <button
                onClick={() => {
                  setShowCropper(false);
                  setImageSrc(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {successMessage && (
        <p className="text-green-500 text-sm">{successMessage}</p>
      )}
    </div>
  );
} 