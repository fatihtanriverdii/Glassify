'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaceType, GlassesType, uploadGlasses } from '@/services/glassesService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

const UploadGlassesPage = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [glassesType, setGlassesType] = useState<GlassesType | ''>('');
    const [link, setLink] = useState<string>('');
    const [faceShapes, setFaceShapes] = useState({
        oval: false,
        oblong: false,
        heart: false,
        round: false,
        square: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [isRecycling, setIsRecycling] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        // Check file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Hata',
                description: 'Lütfen geçerli bir resim dosyası seçin.',
                variant: 'destructive'
            });
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Hata',
                description: 'Dosya boyutu 5MB\'dan küçük olmalıdır.',
                variant: 'destructive'
            });
            return;
        }

        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!selectedImage || !glassesType || !link) {
            toast({
                title: 'Hata',
                description: 'Lütfen bir fotoğraf seçin, gözlük tipini belirleyin ve link girin.',
                variant: 'destructive'
            });
            return;
        }

        // Check if at least one face shape is selected
        if (!Object.values(faceShapes).some(value => value)) {
            toast({
                title: 'Hata',
                description: 'Lütfen en az bir yüz şekli seçin.',
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await uploadGlasses(selectedImage, glassesType as GlassesType, faceShapes, link, isRecycling);
            toast({
                title: response.isSuccess ? 'Başarılı' : 'Hata',
                description: response.message,
                variant: response.isSuccess ? 'default' : 'destructive'
            });

            if (response.isSuccess) {
                setSelectedImage(null);
                setImagePreview('');
                setGlassesType('');
                setLink('');
                setFaceShapes({
                    oval: false,
                    oblong: false,
                    heart: false,
                    round: false,
                    square: false
                });
                setIsRecycling(false);
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Gözlük yükleme işlemi sırasında bir hata oluştu.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <button
                onClick={() => router.back()}
                className="mb-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2 transition-all duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Geri
            </button>
            <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-xl border-0 dark:border-gray-800">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-blue-700 text-white dark:text-gray-200 rounded-t-xl">
                    <CardTitle className="text-2xl font-bold text-center">Gözlük Yükle</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div 
                        className={`
                            relative border-2 border-dashed rounded-lg p-6
                            ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-gray-800' : 'border-gray-300'}
                            transition-colors duration-200 ease-in-out
                            ${!selectedImage ? 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer' : 'bg-gray-50 dark:bg-gray-800'}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => !selectedImage && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        
                        {!selectedImage ? (
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 mb-4">
                                    <svg
                                        className="w-full h-full text-blue-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                </div>
                                <div className="text-lg font-medium text-gray-800 dark:text-gray-100 font-semibold mb-1">
                                    Fotoğraf yüklemek için tıklayın
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    veya dosyayı sürükleyip bırakın
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    PNG, JPG veya GIF (max. 5MB)
                                </p>
                            </div>
                        ) : (
                            <div className="relative aspect-video bg-gray-100 rounded-lg">
                                <img
                                    src={imagePreview}
                                    alt="Gözlük önizleme"
                                    className="w-full h-full object-contain rounded-lg"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(null);
                                        setImagePreview('');
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-gray-900/70 rounded-full hover:bg-gray-900/90 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Gözlük Tipi
                        </label>
                        <Select value={glassesType} onValueChange={(value) => setGlassesType(value as GlassesType)}>
                            <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 hover:bg-white dark:hover:bg-gray-800">
                                <SelectValue placeholder="Gözlük tipini seçin" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                <SelectItem value="Round" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-gray-700">Yuvarlak</SelectItem>
                                <SelectItem value="CatEye" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-gray-700">Cat Eye</SelectItem>
                                <SelectItem value="Rectangle" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-gray-700">Dikdörtgen</SelectItem>
                                <SelectItem value="Square" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-gray-700">Kare</SelectItem>
                                <SelectItem value="Aviator" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-gray-700">Aviator</SelectItem>
                                <SelectItem value="Geometric" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-gray-700">Geometrik</SelectItem>
                                <SelectItem value="Browline" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-gray-700">Browline</SelectItem>
                                <SelectItem value="Oval" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-gray-700">Oval</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Link
                        </label>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="Gözlük satış linkini girin"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800 hover:bg-white dark:hover:bg-gray-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Uygun Yüz Şekilleri
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(faceShapes).map(([shape, checked]) => (
                                <div key={shape} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={shape}
                                        checked={checked}
                                        onCheckedChange={(checked: boolean | 'indeterminate') => 
                                            setFaceShapes(prev => ({
                                                ...prev,
                                                [shape]: checked === true
                                            }))
                                        }
                                    />
                                    <label
                                        htmlFor={shape}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {shape === 'oval' && 'Oval'}
                                        {shape === 'oblong' && 'Uzun'}
                                        {shape === 'heart' && 'Kalp'}
                                        {shape === 'round' && 'Yuvarlak'}
                                        {shape === 'square' && 'Kare'}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Geri Dönüşümlü Ürün
                        </label>
                        <div className="flex items-center space-x-2">
                            <span className="recycling-badge bg-white dark:bg-gray-900 border border-green-500 dark:border-green-400 text-green-700 dark:text-green-400 p-0.5 rounded-full text-sm font-semibold flex items-center justify-center shadow" style={{ width: 22, height: 22 }}>
                              <span className="text-green-500 dark:text-green-400 text-[15px]">♻️</span>
                            </span>
                            <Checkbox
                                id="isRecycling"
                                checked={isRecycling}
                                onCheckedChange={(checked: boolean | 'indeterminate') => setIsRecycling(checked === true)}
                            />
                            <label htmlFor="isRecycling" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Bu gözlük geri dönüşümlü materyalden üretilmiştir
                            </label>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white dark:text-gray-200 transition-colors duration-200"
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedImage || !glassesType || !Object.values(faceShapes).some(value => value)}
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Yükleniyor...
                            </>
                        ) : (
                            'Gözlük Yükle'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default UploadGlassesPage; 