import React from 'react';
import ImageUploadForm from '../../components/UICamiones/ImageUploadAgregar';

const ImageUploadSection = ({
  imagePreview,
  onImageChange,
  onRemoveImage,
  register,
  error
}) => {
  return (
    <div className="mb-6 sm:mb-8">
      <ImageUploadForm
        imagePreview={imagePreview}
        onImageChange={onImageChange}
        onRemoveImage={onRemoveImage}
        {...register("img", { required: true })}
        error={error}
        required
        size="large"
      />
    </div>
  );
};

export default ImageUploadSection;