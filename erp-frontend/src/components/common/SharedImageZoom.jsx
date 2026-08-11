"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export default function SharedImageZoom({
  id,
  src,
  alt = "Avatar",
  placeholderText = "U",
  thumbnailClassName = "w-10 h-10 rounded-full",
  modalImageClassName = "w-72 h-72 rounded-full",
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
        className={`${thumbnailClassName} bg-blue-50 text-[#1565c0] flex items-center justify-center font-bold select-none border border-blue-100`}
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

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="cursor-pointer select-none"
      >
        <motion.img
          layoutId={layoutId}
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className={`${thumbnailClassName} object-cover`}
          transition={transition}
        />
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={transition}
                className="absolute inset-0"
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute -top-12 right-0 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/75 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </motion.div>

              <motion.img
                layoutId={layoutId}
                src={src}
                alt={alt}
                className={`${modalImageClassName} object-cover shadow-2xl bg-white border-4 border-white`}
                transition={transition}
              />

              {alt && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 px-3 py-1 bg-black/70 text-white text-xs font-semibold rounded-md shadow"
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
