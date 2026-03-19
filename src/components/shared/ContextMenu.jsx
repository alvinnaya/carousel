import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * A reusable context menu component that appears at a specific (x, y) coordinate
 * and automatically flips its position to stay within the viewport.
 * 
 * @param {Object} props
 * @param {number} props.x - The x coordinate (clientX).
 * @param {number} props.y - The y coordinate (clientY).
 * @param {boolean} props.isOpen - Whether the menu is visible.
 * @param {Function} props.onClose - Callback to close the menu.
 * @param {React.ReactNode} props.children - Menu items.
 */
const ContextMenu = ({ x, y, isOpen, onClose, children, className = "" }) => {
    const [adjustedStyle, setAdjustedStyle] = useState({});
    const menuRef = useRef(null);

    useLayoutEffect(() => {
        if (isOpen && menuRef.current) {
            const menu = menuRef.current;
            const rect = menu.getBoundingClientRect();
            
            const midX = window.innerWidth / 2;
            const midY = window.innerHeight / 2;

            let newTop = y;
            let newLeft = x;

            // Horizontal quadrant detection
            if (x > midX) {
                // Right half of screen -> menu expands to the LEFT
                newLeft = x - rect.width;
            }

            // Vertical quadrant detection
            if (y > midY) {
                // Bottom half of screen -> menu expands to the TOP
                newTop = y - rect.height;
            }

            setAdjustedStyle({
                top: newTop,
                left: newLeft,
                opacity: 1,
                visibility: 'visible'
            });
        } else {
            setAdjustedStyle({
                opacity: 0,
                visibility: 'hidden'
            });
        }
    }, [isOpen, x, y]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', onClose, true);
            window.addEventListener('resize', onClose);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', onClose, true);
            window.removeEventListener('resize', onClose);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={menuRef}
            className={`fixed z-[999999] mus-card !bg-[#FDFAF5] !p-1.5 min-w-[200px] !transition-none select-none ${className}`}
            style={{
                top: adjustedStyle.top !== undefined ? adjustedStyle.top : y,
                left: adjustedStyle.left !== undefined ? adjustedStyle.left : x,
                opacity: adjustedStyle.opacity ?? 0,
                visibility: adjustedStyle.visibility ?? 'hidden',
                transition: 'none',
                transform: 'none'
            }}
            onContextMenu={(e) => e.preventDefault()} // Prevent native menu on our menu
            onWheel={(e) => e.stopPropagation()}
        >
            {children}
        </div>,
        document.body
    );
};

export default ContextMenu;
