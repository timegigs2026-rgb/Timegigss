import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralsModal: React.FC<ModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-30 bg-white animate-in fade-in duration-150" />
  );
};
