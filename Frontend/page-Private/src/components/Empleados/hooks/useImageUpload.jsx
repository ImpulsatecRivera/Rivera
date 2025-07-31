import { useState } from 'react';

export const useImageUpload = () => {
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e, setFormData) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        img: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (setFormData) => {
    setFormData(prev => ({
      ...prev,
      img: null
    }));
    setImagePreview(null);

    const fileInput = document.getElementById('img-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return {
    imagePreview,
    handleImageChange,
    removeImage,
    setImagePreview
  };
};