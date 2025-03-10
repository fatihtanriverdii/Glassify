import React, { createContext, useContext } from 'react';
import faceShapeService from '../services/faceShapeService';

interface FaceShapeContextType {
  predictFaceShape: (formData: FormData) => Promise<any>;
}

const FaceShapeContext = createContext<FaceShapeContextType | undefined>(undefined);

export const FaceShapeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const predictFaceShape = async (formData: FormData) => {
    return await faceShapeService.predictFaceShape(formData);
  };

  return (
    <FaceShapeContext.Provider value={{ predictFaceShape }}>
      {children}
    </FaceShapeContext.Provider>
  );
};

export const useFaceShape = () => {
  const context = useContext(FaceShapeContext);
  if (context === undefined) {
    throw new Error('useFaceShape must be used within a FaceShapeProvider');
  }
  return context;
};

export default FaceShapeProvider; 