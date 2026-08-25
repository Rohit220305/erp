import React, { useState } from "react";
import { Upload, X, Star, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function MultiImageUploader({ images = [], onChange, maxImages = 10, maxSizeMB = 5 }) {
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    setError(null);
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images.`);
      e.target.value = "";
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size should not exceed ${maxSizeMB}MB.`);
        return false;
      }
      return true;
    });

    const newImageObjects = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      isPrimary: false,
      isExisting: false,
    }));

    if (images.length === 0 && newImageObjects.length > 0) {
      newImageObjects[0].isPrimary = true;
    }

    onChange([...images, ...newImageObjects]);
    e.target.value = "";
  };

  const handleRemove = (idToRemove) => {
    const updatedImages = images.filter((img) => img.id !== idToRemove);
    const hadPrimary = updatedImages.some((img) => img.isPrimary);
    if (!hadPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }
    onChange(updatedImages);
  };

  const setPrimary = (idToPrimary) => {
    const updatedImages = images.map((img) => ({
      ...img,
      isPrimary: img.id === idToPrimary,
    }));
    onChange(updatedImages);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Item Images ({images.length}/{maxImages})
        </label>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.length < maxImages && (
          <div 
            onClick={() => document.getElementById("multi-image-file-input")?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-[#1565c0] hover:bg-blue-50 transition-colors group"
          >
            <Upload size={24} className="text-gray-400 group-hover:text-[#1565c0] mb-2" />
            <span className="text-xs text-gray-500 group-hover:text-[#1565c0] font-medium">Add Image</span>
            <span className="text-[10px] text-gray-400 mt-1">Up to {maxSizeMB}MB</span>
            <input 
              id="multi-image-file-input"
              type="file" 
              className="hidden" 
              multiple 
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {images.map((img, index) => (
          <div 
            key={img.id} 
            className={`relative rounded-lg aspect-square border-2 overflow-hidden group ${
              img.isPrimary ? "border-amber-400 shadow-md" : "border-gray-200"
            }`}
          >
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              {img.url ? (
                <Image 
                  src={img.url} 
                  alt={`Preview ${index}`} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <ImageIcon className="text-gray-300" size={32} />
              )}
            </div>

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-between w-full">
                <button
                  type="button"
                  onClick={() => setPrimary(img.id)}
                  title="Set as Primary Image"
                  className={`p-1.5 rounded-full transition-colors ${
                    img.isPrimary 
                      ? "bg-amber-400 text-white" 
                      : "bg-white/80 text-gray-600 hover:bg-white"
                  }`}
                >
                  <Star size={14} className={img.isPrimary ? "fill-white" : ""} />
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  title="Remove Image"
                  className="p-1.5 rounded-full bg-white/80 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="w-full text-center">
                <span className="text-[10px] font-medium text-white bg-black/60 px-2 py-0.5 rounded-full">
                  {img.isPrimary ? "Primary" : "Secondary"}
                </span>
              </div>
            </div>

            {img.isPrimary && (
              <div className="absolute top-2 left-2 p-1 bg-amber-400 text-white rounded-full shadow-sm group-hover:opacity-0 transition-opacity">
                <Star size={12} className="fill-white" />
              </div>
            )}
            
            {img.isNew && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm group-hover:opacity-0 transition-opacity">
                <CheckCircle2 size={10} />
                New
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
