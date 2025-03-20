import { getCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:7289/api';

export type FaceType = 'Round' | 'Square' | 'Oval' | 'Heart' | 'Oblong';
export type GlassesType = 'Round' | 'CatEye' | 'Rectangle' | 'Square' | 'Aviator' | 'Geometric' | 'Browline' | 'Oval';

interface UploadGlassesResponse {
    isSuccess: boolean;
    message: string;
}

interface DecodedToken {
    email: string;
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
    }
): Promise<UploadGlassesResponse> => {
    try {
        const token = getCookie('token') as string;
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
            email: decoded.email
        };

        const response = await fetch(`${API_URL}/User/add/glasses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        return {
            isSuccess: data.isSuccess,
            message: data.message
        };
    } catch (error) {
        return {
            isSuccess: false,
            message: 'Gözlük yükleme işlemi başarısız oldu.'
        };
    }
}

export interface Glass {
    id: string;
    image: string;
    faceType: FaceType;
    glassesType: GlassesType;
    createdAt: string;
}

export interface GetGlassesResponse {
    isSuccess: boolean;
    message: string;
    data: Glass[];
}

interface APIResponse {
    isSuccess: boolean;
    glasses: {
        id: number;
        image: string;
        faceType: FaceType;
        glassesType: GlassesType;
    }[];
    message: string | null;
}

export const getSellerGlasses = async (): Promise<GetGlassesResponse> => {
    try {
        const token = getCookie('token') as string;
        const decoded = jwtDecode(token) as DecodedToken;

        const response = await fetch(`${API_URL}/User/glasses?email=${decoded.email}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('API yanıt vermedi');
        }

        const data = await response.json() as APIResponse;
        
        if (!data.isSuccess || !data.glasses) {
            return {
                isSuccess: false,
                message: data.message || 'Geçersiz veri formatı',
                data: []
            };
        }

        return {
            isSuccess: true,
            message: 'Gözlükler başarıyla getirildi.',
            data: data.glasses.map(glass => ({
                id: glass.id.toString(),
                image: `data:image/jpeg;base64,${glass.image}`,
                faceType: glass.faceType,
                glassesType: glass.glassesType,
                createdAt: new Date().toISOString()
            }))
        };
    } catch (error) {
        console.error('Gözlükler getirilirken hata:', error);
        return {
            isSuccess: false,
            message: 'Gözlükler getirilirken bir hata oluştu.',
            data: []
        };
    }
};

export const deleteGlasses = async (id: string): Promise<{ isSuccess: boolean; message: string }> => {
    try {
        const token = getCookie('token') as string;
        const decoded = jwtDecode(token) as DecodedToken;

        const removeGlassesRequestDto = {
            glassesId: id,
            email: decoded.email
        };

        const response = await fetch(`${API_URL}/User/remove/glasses`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(removeGlassesRequestDto)
        });

        const data = await response.json();
        return {
            isSuccess: data.isSuccess,
            message: data.message || 'Gözlük başarıyla silindi.'
        };
    } catch (error) {
        return {
            isSuccess: false,
            message: 'Gözlük silinirken bir hata oluştu.'
        };
    }
}; 