import { getCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import * as faceapi from '@vladmandic/face-api';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export type FaceType = 'Round' | 'Square' | 'Oval' | 'Heart' | 'Oblong';
export type GlassesType = 'Round' | 'CatEye' | 'Rectangle' | 'Square' | 'Aviator' | 'Geometric' | 'Browline' | 'Oval';

interface UploadGlassesResponse {
    isSuccess: boolean;
    message: string;
}

interface DecodedToken {
    email: string;
}

export interface Glass {
    id: string;
    image: string;
    glassesType: string;
    link: string;
    isRecycling: boolean;
    oval: boolean;
    oblong: boolean;
    heart: boolean;
    round: boolean;
    square: boolean;
    createdAt?: string;
}

export interface GetGlassesResponse {
    items: Glass[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

// Load face-api.js models
async function loadModels() {
    try {
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        ]);
    } catch (error) {
        console.error('Error loading models:', error);
        throw new Error('Yüz tanıma modelleri yüklenemedi');
    }
}

export const uploadGlasses = async (
    image: File, 
    glassesType: GlassesType,
    faceShapes: {
        oval: boolean;
        oblong: boolean;
        heart: boolean;
        round: boolean;
        square: boolean;
    },
    link: string,
    isRecycling: boolean
): Promise<UploadGlassesResponse> => {
    try {
        const token = localStorage.getItem('token') || 
            document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        if (!token) {
            throw new Error('Token bulunamadı');
        }

        const decoded = jwtDecode(token) as DecodedToken;

        const base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1] || base64String;
                resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(image);
        });

        const requestData = {
            image: base64Image,
            glassesType: glassesType,
            oval: faceShapes.oval,
            oblong: faceShapes.oblong,
            heart: faceShapes.heart,
            round: faceShapes.round,
            square: faceShapes.square,
            email: decoded.email,
            link: link,
            isRecycling: isRecycling
        };

        const response = await fetch(`${API_URL}/User/add/glasses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Sunucu hatası oluştu');
        }

        const data = await response.json();
        return {
            isSuccess: data.isSuccess,
            message: data.message || 'Gözlük başarıyla yüklendi'
        };
    } catch (error) {
        console.error('Gözlük yükleme hatası:', error);
        return {
            isSuccess: false,
            message: error instanceof Error ? error.message : 'Gözlük yükleme işlemi başarısız oldu'
        };
    }
};

export const getSellerGlasses = async (page = 1): Promise<GetGlassesResponse> => {
    const token = localStorage.getItem('token') || 
        document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
        throw new Error('Token bulunamadı');
    }

    const decoded = jwtDecode(token) as DecodedToken;

    const response = await fetch(`${API_URL}/User/glasses?email=${decoded.email}&pageNumber=${page}&pageSize=5`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('API yanıt vermedi');
    }

    const data = await response.json();

    data.items = (data.items || []).map((glass: any) => ({
        ...glass,
        id: glass.id.toString(),
        image: glass.image.startsWith('data:') ? glass.image : `data:image/jpeg;base64,${glass.image}`,
    }));

    return data;
};

export const tryOnGlasses = async (faceImage: string, glassesImage: string, sizeMultiplier: number = 2.5): Promise<string> => {
    try {
        // Load face-api.js models if not already loaded
        await loadModels();

        // Create an image element for face detection
        const faceImg = new Image();
        faceImg.crossOrigin = "anonymous"; // Enable CORS
        
        // Create a canvas to handle the face image
        const faceCanvas = document.createElement('canvas');
        const faceCtx = faceCanvas.getContext('2d');
        if (!faceCtx) {
            throw new Error('Canvas context oluşturulamadı');
        }

      // Load face image
        await new Promise((resolve, reject) => {
            faceImg.onload = () => {
                faceCanvas.width = faceImg.width;
                faceCanvas.height = faceImg.height;
                faceCtx.drawImage(faceImg, 0, 0);
                resolve(null);
            };
            faceImg.onerror = () => reject(new Error('Yüz fotoğrafı yüklenemedi'));
            faceImg.src = faceImage;
        });

        // Detect face landmarks using the canvas
        const detection = await faceapi.detectSingleFace(faceCanvas).withFaceLandmarks();
        if (!detection) {
            throw new Error('Yüzde göz konumları tespit edilemedi');
        }

        // Get eye positions
        const leftEye = detection.landmarks.getLeftEye();
        const rightEye = detection.landmarks.getRightEye();

        // Calculate eye centers
        const leftEyeCenter = {
            x: leftEye.reduce((sum, point) => sum + point.x, 0) / leftEye.length,
            y: leftEye.reduce((sum, point) => sum + point.y, 0) / leftEye.length
        };
        const rightEyeCenter = {
            x: rightEye.reduce((sum, point) => sum + point.x, 0) / rightEye.length,
            y: rightEye.reduce((sum, point) => sum + point.y, 0) / rightEye.length
        };

        // Calculate angle between eyes
        const angle = Math.atan2(
            rightEyeCenter.y - leftEyeCenter.y,
            rightEyeCenter.x - leftEyeCenter.x
        ) * (180 / Math.PI);

        // Calculate distance between eyes for glasses sizing
        const eyeDistance = Math.sqrt(
            Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) +
            Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
        );

        // Create canvas for final composition
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = faceCanvas.width;
        outputCanvas.height = faceCanvas.height;
        const ctx = outputCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas context oluşturulamadı');
        }

        // Draw face image
        ctx.drawImage(faceCanvas, 0, 0);

        // Load and draw glasses
        const glassesImg = new Image();
        glassesImg.crossOrigin = "anonymous"; // Enable CORS
        
        await new Promise((resolve, reject) => {
            glassesImg.onload = resolve;
            glassesImg.onerror = () => reject(new Error('Gözlük görseli yüklenemedi'));
            
            // If glassesImage is base64, use it directly, otherwise add data URL prefix
            if (glassesImage.startsWith('data:')) {
                glassesImg.src = glassesImage;
            } else {
                glassesImg.src = `data:image/png;base64,${glassesImage}`;
            }
        });

        // Calculate glasses dimensions using the provided size multiplier
        const glassesWidth = eyeDistance * sizeMultiplier;
        const glassesHeight = (glassesWidth * glassesImg.height) / glassesImg.width;

        // Calculate glasses position
        const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
        const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
        const glassesX = centerX - glassesWidth / 2;
        const glassesY = centerY - glassesHeight / 2;

        // Save canvas state for rotation
        ctx.save();
        
        // Translate to center point, rotate, and translate back
        ctx.translate(centerX, centerY);
        ctx.rotate(angle * Math.PI / 180);
        ctx.translate(-centerX, -centerY);

        // Set opacity for glasses
        ctx.globalAlpha = 0.85;

        // Draw glasses
        ctx.drawImage(
            glassesImg,
            glassesX,
            glassesY,
            glassesWidth,
            glassesHeight
        );

        // Restore canvas state
        ctx.restore();

        // Return the composite image
        return outputCanvas.toDataURL('image/png');
    } catch (error) {
        console.error('Gözlük yerleştirme hatası:', error);
        throw error instanceof Error 
            ? error 
            : new Error('Gözlük deneme işlemi sırasında bir hata oluştu');
    }
};

export const deleteGlasses = async (glassId: string): Promise<{ isSuccess: boolean; message: string }> => {
    try {
        const token = localStorage.getItem('token') || 
            document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        if (!token) {
            throw new Error('Token bulunamadı');
        }

        const decoded = jwtDecode(token) as DecodedToken;

        const response = await fetch(`${API_URL}/User/remove/glasses`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                glassesId: parseInt(glassId),
                email: decoded.email
            })
        });

        const data = await response.json();
        return {
            isSuccess: data.isSuccess,
            message: data.message || 'Gözlük başarıyla silindi'
        };
    } catch (error) {
        console.error('Gözlük silinirken hata:', error);
        return {
            isSuccess: false,
            message: 'Gözlük silinirken bir hata oluştu'
        };
    }
};

export const detectFace = async (imageData: string): Promise<boolean> => {
    try {
        // Make sure models are loaded
        await loadModels();

        // Create an image element
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        // Create a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Canvas context oluşturulamadı');
        }

        // Load the image and set up canvas
        await new Promise<void>((resolve, reject) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                resolve();
            };
            img.onerror = () => reject(new Error('Fotoğraf yüklenemedi'));
            img.src = imageData;
        });

        // Detect face with high confidence threshold
        const result = await faceapi.detectSingleFace(canvas, new faceapi.SsdMobilenetv1Options({ 
            minConfidence: 0.5 // Increase confidence threshold
        }));

        // Return true only if a face is detected with high confidence
        return result !== null && result !== undefined && result.score > 0.5;
    } catch (error) {
        console.error('Yüz tespiti hatası:', error);
        return false;
    }
}; 