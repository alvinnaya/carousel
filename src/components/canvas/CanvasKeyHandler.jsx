import { useEffect } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import { deleteObject } from '../Helper/FabricHelper';

const CanvasKeyHandler = () => {
    const { canvas } = useCanvasContext();

    useEffect(() => {
        if (!canvas) return;

        const handleKeyDown = (e) => {
            // Check if focus is on an input or textarea
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable) {
                return;
            }

            // Handle Backspace or Delete key
            if (e.key === 'Backspace' || e.key === 'Delete') {
                const activeObjects = canvas.getActiveObjects();
                
                if (activeObjects && activeObjects.length > 0) {
                    // Prevent default backspace behavior (like going back in browser history if not focused)
                    e.preventDefault();
                    
                    activeObjects.forEach(obj => {
                        deleteObject(obj, canvas);
                    });
                    
                    canvas.discardActiveObject();
                    canvas.requestRenderAll();
                    console.log(`Deleted ${activeObjects.length} object(s)`);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas]);

    return null;
};

export default CanvasKeyHandler;
