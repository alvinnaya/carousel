import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable Modal component for displaying content over the main application.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is currently visible
 * @param {Function} props.onClose - Function to call when the modal requests to close
 * @param {string} props.title - The title text displayed in the modal header
 * @param {React.ReactNode} props.children - The content to display inside the modal body
 * @param {React.ReactNode} props.footer - Optional footer content (e.g., action buttons)
 * @param {string} props.className - Optional additional classes for the modal container
 */
const Modal = ({ isOpen, onClose, title, children, footer, className = "" }) => {
    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent scrolling on body when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Backdrop (click to close) */}
            <div 
                className="absolute inset-0" 
                onClick={onClose}
                aria-label="Close modal background"
            ></div>

            {/* Modal Content container */}
            <div 
                className={`relative mus-modal-container w-full max-w-md mx-4 animate-in zoom-in-95 duration-200 ${className}`}
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mus-modal-header">
                    <h2 className="mus-modal-title">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="mus-modal-close-btn"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="mus-modal-body">
                    {children}
                </div>

                {/* Footer (optional) */}
                {footer && (
                    <div className="mus-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
