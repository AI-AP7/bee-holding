"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useModalStore } from "@/lib/store";
import { useEffect } from "react";
import AboutModal from "./AboutModal";
import CompaniesModal from "./CompaniesModal";
import ContactModal from "./ContactModal";

export default function ModalSystem() {
  const { activeModal, isModalOpen, closeModal } = useModalStore();

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen, closeModal]);

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeModal === "about" && <AboutModal key="about" />}
              {activeModal === "companies" && <CompaniesModal key="companies" />}
              {activeModal === "contact" && <ContactModal key="contact" />}
            </AnimatePresence>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
