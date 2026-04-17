import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for exit animation
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message && !isVisible) return null;

    const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-gray-800';
    const icon = type === 'success' ? (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
    ) : type === 'error' ? (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    ) : null;

    return createPortal(
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[999999] transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg shadow-black/10 text-white font-medium text-sm ${bgColor}`}>
                {icon}
                {message}
            </div>
        </div>,
        document.body
    );
};

export default Toast;
