import React, { useEffect, useState } from 'react';
import { changeCornerRadius } from '../../../Helper/FabricHelper';
import { useCanvasContext } from '../../../../context/CanvasContext';
import DelayedInput from './DelayedInput';

const CornerRadiusTool = ({ activeObject }) => {
    const { canvas } = useCanvasContext();
    const [radius, setRadius] = useState(0);

    const getRadius = (obj) => {
        if (!obj) return 0;
        if (obj.type === 'image' || obj.type === 'FabricImage' || (obj.constructor && obj.constructor.name === 'FabricImage')) {
            return obj.clipPath?.rx || 0;
        }
        return obj.rx || 0;
    };

    useEffect(() => {
        if (!activeObject || !canvas) return;

        setRadius(getRadius(activeObject));

        const handleModified = (e) => {
            if (e.target === activeObject) {
                setRadius(getRadius(activeObject));
            }
        };

        canvas.on('object:modified', handleModified);
        return () => {
            canvas.off('object:modified', handleModified);
        };
    }, [activeObject, canvas]);

    const handleRadiusChange = (value) => {
        const val = parseInt(value, 10) || 0;
        setRadius(val);
        changeCornerRadius(activeObject, val, canvas);
    };

    if (!activeObject) return null;

    // Only show for images and rects (or objects that reasonably support corner radius)
    const isSupported = activeObject.type === 'rect' ||
        activeObject.type === 'image' ||
        activeObject.type === 'FabricImage' ||
        (activeObject.constructor && activeObject.constructor.name === 'FabricImage');

    if (!isSupported) return null;

    return (
        <section className="mus-tool-section">
            <h3 className="mus-tool-label">Corner Radius</h3>
            <div className="flex items-center gap-3">
                <div className="mus-tool-badge w-12 h-7 flex items-center justify-center gap-0.5 flex-shrink-0 px-2">
                    <DelayedInput
                        value={radius}
                        isNumeric={true}
                        min="0"
                        max="100"
                        onChange={handleRadiusChange}
                        className="mus-tool-input-pure !text-[10px] !text-right w-full"
                    />
                    <span className="text-[9px] font-extrabold text-[#7A7062] select-none">px</span>
                </div>
                <div className="flex-1 flex items-center">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={radius}
                        onChange={(e) => handleRadiusChange(e.target.value)}
                        className="mus-tool-range w-full"
                    />
                </div>
            </div>
        </section>
    );
};

export default CornerRadiusTool;
