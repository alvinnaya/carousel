import { useEffect } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

const CanvasUndoRedoHandler = () => {
    const { undo, redo, activeCanvasIndex } = useCanvasContext();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check if user is typing in an input, textarea, or contentEditable element
            const isTyping = e.target.tagName === 'INPUT' || 
                             e.target.tagName === 'TEXTAREA' || 
                             e.target.isContentEditable;

            if (isTyping) return;

            const isCtrl = e.ctrlKey || e.metaKey;

            // Undo: Ctrl + Z
            if (isCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                console.log('Undo triggered via keyboard');
                undo(activeCanvasIndex);
            }

            // Redo: Ctrl + Y or Ctrl + Shift + Z
            if (isCtrl && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
                e.preventDefault();
                console.log('Redo triggered via keyboard');
                redo(activeCanvasIndex);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo, activeCanvasIndex]);

    return null;
};

export default CanvasUndoRedoHandler;
