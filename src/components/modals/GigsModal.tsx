import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GigsModal: React.FC<ModalProps> = ({ isOpen }) => {
  // Return null so the map "as is" remains fully visible for the GiGs feature
  // The controls (search/zoom) are rendered in App.tsx
  return null;
};
