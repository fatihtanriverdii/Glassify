export const faceShapeService = {
  predictFaceShape: async (formData: FormData) => {
    try {
      const response = await fetch('https://fatyidha-FaceShapeAPI.hf.space/predict/', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Face shape prediction failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in face shape prediction:', error);
      throw error;
    }
  }
};

export default faceShapeService; 