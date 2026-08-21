"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export default function SharedImageZoom({
  id,
  src,
  alt = "Image",
  placeholderText = "U",
  thumbnailClassName = "w-10 h-10 rounded-lg",
  modalImageClassName = "max-w-[65vw] max-h-[60vh] w-auto h-auto rounded-xl",
  objectFit = "contain",
  animConfig = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const hasImage = src && !hasError;

  if (!hasImage) {
    return (
      <div
        className={`${thumbnailClassName} bg-blue-50 text-[#1565c0] flex items-center justify-center font-bold select-none border border-blue-100 shrink-0`}
      >
        {placeholderText}
      </div>
    );
  }

  const transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    ...animConfig,
  };

  const layoutId = `shared-img-${id}`;
  const fitClass = objectFit === "cover" ? "object-cover" : "object-contain bg-gray-50/80";

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="cursor-pointer select-none shrink-0"
      >
        <motion.img
          layoutId={layoutId}
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className={`${thumbnailClassName} ${fitClass}`}
          transition={transition}
        />
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center p-4"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />

              <div
                className="relative z-10 flex flex-col items-center justify-center max-w-[90vw] max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute -top-10 -right-2 p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition cursor-pointer shadow-lg z-20"
                >
                  <X size={18} />
                </button>

                <motion.img
                  layoutId={layoutId}
                  src={src}
                  alt={alt}
                  className={`${modalImageClassName} object-contain shadow-2xl bg-white border border-gray-200`}
                  transition={transition}
                />

                {alt && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-3 px-3 py-1.5 bg-black/80 text-white text-xs font-medium rounded-md shadow max-w-lg truncate"
                  >
                    {alt}
                  </motion.span>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
