import React, { useState, useRef, useLayoutEffect, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

const DropdownContext = createContext(null);

/**
 * A smart dropdown component that automatically adjusts its position
 * (top/bottom/left/right) based on the available space in the viewport.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.trigger - The element that triggers the dropdown.
 * @param {React.ReactNode} props.children - The content of the dropdown.
 * @param {boolean} props.isOpen - Controlled state for dropdown visibility.
 * @param {Function} props.onClose - Callback triggered when closing the dropdown.
 * @param {string} props.className - Optional additional classes for the dropdown container.
 */
const SmartDropdown = ({ trigger, children, isOpen, onClose, triggerClassName = "", className = "" }) => {
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [positionStyle, setPositionStyle] = useState({});
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const parentContext = useContext(DropdownContext);
    
    // Unique ID for this instance to track it in nested events
    const [dropdownId] = useState(() => Math.random().toString(36).substr(2, 9));

    // Update trigger coordinates when opened or window resized
    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                bottom: rect.bottom,
                right: rect.right
            });
        }
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
            return () => {
                window.removeEventListener('scroll', updateCoords, true);
                window.removeEventListener('resize', updateCoords);
            };
        }
    }, [isOpen]);

    useLayoutEffect(() => {
        if (isOpen && dropdownRef.current && triggerRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top = triggerRect.bottom + 8; // Default: below
            let left = triggerRect.left;

            // ── Vertical Positioning ──────────────────────────────────────────
            const spaceBelow = viewportHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;

            if (spaceBelow < dropdownRect.height && spaceAbove > dropdownRect.height) {
                // Not enough space below, but enough above -> Show ABOVE
                top = triggerRect.top - dropdownRect.height - 8;
            }

            // ── Horizontal Positioning ───────────────────────────────────────
            const spaceRight = viewportWidth - triggerRect.left;

            if (spaceRight < dropdownRect.width) {
                // Not enough space to the right -> Align to RIGHT edge of trigger
                left = triggerRect.right - dropdownRect.width;

                // If it still overflows the left edge of screen
                if (left < 10) left = 10;
            }

            setPositionStyle({
                top: `${top}px`,
                left: `${left}px`,
                minWidth: `${triggerRect.width}px`,
                '--trigger-width': `${triggerRect.width}px`
            });
        }
    }, [isOpen, coords.top, coords.left]);

    // Used to signal to parents that a click happened inside one of their descendants
    const markActive = (nativeEvent) => {
        if (!nativeEvent.__smartDropdowns) nativeEvent.__smartDropdowns = new Set();
        nativeEvent.__smartDropdowns.add(dropdownId);
        if (parentContext) parentContext.markActive(nativeEvent);
    };

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the event is marked as "inside" this dropdown (or its child), don't close
            const isInside = event.__smartDropdowns?.has(dropdownId);
            
            if (
                isOpen &&
                !isInside &&
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                triggerRef.current && !triggerRef.current.contains(event.target)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, dropdownId]);

    const handleContentMouseDown = (e) => {
        markActive(e.nativeEvent);
        // We do NOT stop propagation here to allow parents to receive native events 
        // and children to receive outside-click notifications when parent is clicked.
    };

    return (
        <DropdownContext.Provider value={{ markActive }}>
            <div ref={triggerRef} className={`inline-block ${triggerClassName}`}>
                {trigger}
            </div>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={positionStyle}
                    onMouseDown={handleContentMouseDown}
                    onClick={(e) => e.stopPropagation()}
                    onWheel={(e) => e.stopPropagation()}
                    className={`fixed z-[9999] animate-in fade-in zoom-in-95 duration-200 ${className}`}
                >
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] shadow-[var(--shadow-md)] rounded-xl p-1.5 overflow-hidden">
                        {children}
                    </div>
                </div>,
                document.body
            )}
        </DropdownContext.Provider>
    );
};

export default SmartDropdown;
