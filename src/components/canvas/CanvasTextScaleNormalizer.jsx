import { useEffect } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

const TEXT_TYPES = new Set(['textbox', 'text', 'i-text', 'itext']);

const isTextObject = (obj) => TEXT_TYPES.has(obj?.type);
const almostEqual = (a, b, epsilon = 0.0001) => Math.abs(a - b) < epsilon;

export default function CanvasTextScaleNormalizer() {
    const { canvas } = useCanvasContext();

    useEffect(() => {
        if (!canvas) return;

        const handleObjectModified = (event) => {
            const target = event?.target;
            if (!isTextObject(target)) return;

            const scaleX = target.scaleX ?? 1;
            const scaleY = target.scaleY ?? 1;
            const hasScale = !almostEqual(scaleX, 1) || !almostEqual(scaleY, 1);

            if (!hasScale) return;

            const updates = {
                fontSize: Math.max(1, Math.round((target.fontSize ?? 16) * scaleY)),
                scaleX: 1,
                scaleY: 1,
            };

            if (target.type === 'textbox' && target.width) {
                updates.width = Math.max(1, target.width * scaleX);
            }

            target.set(updates);
            target.setCoords();
            canvas.requestRenderAll();
        };

        canvas.on('object:modified', handleObjectModified);

        return () => {
            canvas.off('object:modified', handleObjectModified);
        };
    }, [canvas]);

    return null;
}
