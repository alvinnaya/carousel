import React, { useState, useEffect } from 'react';
import { changeShadow } from '../../../Helper/FabricHelper';
import { useCanvasContext } from '../../../../context/CanvasContext';
import DelayedInput from './DelayedInput';
import ColorPaletteSelector from './ColorPaletteSelector';
import CollapsibleToolSection from './CollapsibleToolSection';

const ShadowTool = ({ activeObject }) => {
    const { canvas } = useCanvasContext();
    const [shadowOptions, setShadowOptions] = useState({
        color: 'rgba(0,0,0,0.3)',
        blur: 10,
        offsetX: 5,
        offsetY: 5
    });

    useEffect(() => {
        if (!activeObject || !canvas) return;

        const updateState = () => {
            const s = activeObject.shadow;
            if (s) {
                setShadowOptions({
                    color: s.color || 'rgba(0,0,0,0.3)',
                    blur: s.blur || 0,
                    offsetX: s.offsetX || 0,
                    offsetY: s.offsetY || 0
                });
            } else {
                // Default display values when no shadow is present
                // We don't change the color so the picker stays on the last used/default
                setShadowOptions(prev => ({
                    ...prev,
                    blur: 0,
                    offsetX: 0,
                    offsetY: 0
                }));
            }
        };

        updateState();

        const handleModified = (e) => {
            if (e.target === activeObject) updateState();
        };

        canvas.on('object:modified', handleModified);
        canvas.on('selection:updated', updateState);
        canvas.on('selection:created', updateState);

        return () => {
            canvas.off('object:modified', handleModified);
            canvas.off('selection:updated', updateState);
            canvas.off('selection:created', updateState);
        };
    }, [canvas, activeObject]);

    if (!activeObject) return null;

    const handleApplyShadow = (newOptions) => {
        const updated = { ...shadowOptions, ...newOptions };
        setShadowOptions(updated);
        changeShadow(activeObject, updated, canvas);
    };

    const removeShadow = () => {
        changeShadow(activeObject, null, canvas);
    };

    const hasShadow = !!activeObject.shadow;

    const removeBtn = hasShadow ? (
        <button 
            onClick={removeShadow}
            className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
        >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Remove
        </button>
    ) : null;

    return (
        <CollapsibleToolSection title="Shadow" actionButton={removeBtn}>
            <div className="space-y-5">
                {/* Color with Swatches */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="mus-tool-label !text-primary">Shadow Color</span>
                        <div 
                            className="mus-color-swatch w-6 h-6 border border-zinc-200" 
                            style={{ backgroundColor: shadowOptions.color }} 
                        />
                    </div>
                    <ColorPaletteSelector 
                        color={shadowOptions.color}
                        onChange={(c) => handleApplyShadow({ color: c })} 
                    />
                </div>

                <div className="mus-tool-divider" />

                {/* Blur Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="mus-tool-label !text-primary">Blur</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="mus-tool-badge w-12 h-7 flex items-center justify-center gap-0.5 flex-shrink-0 px-2">
                            <DelayedInput
                                value={shadowOptions.blur}
                                isNumeric={true}
                                min="0"
                                max="100"
                                onChange={(val) => handleApplyShadow({ blur: parseInt(val) || 0 })}
                                className="mus-tool-input-pure !text-[10px] !text-right w-full"
                            />
                            <span className="text-[9px] font-extrabold text-[#7A7062] select-none">px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={shadowOptions.blur}
                            onChange={(e) => handleApplyShadow({ blur: parseInt(e.target.value) })}
                            className="mus-tool-range flex-1"
                        />
                    </div>
                </div>

                {/* Offset X Slider */}
                <div className="space-y-2">
                    <span className="mus-tool-label !text-primary">Offset X</span>
                    <div className="flex items-center gap-3">
                        <div className="mus-tool-badge w-12 h-7 flex items-center justify-center gap-0.5 flex-shrink-0 px-2">
                            <DelayedInput
                                value={shadowOptions.offsetX}
                                isNumeric={true}
                                min="-100"
                                max="100"
                                onChange={(val) => handleApplyShadow({ offsetX: parseInt(val) || 0 })}
                                className="mus-tool-input-pure !text-[10px] !text-right w-full"
                            />
                            <span className="text-[9px] font-extrabold text-[#7A7062] select-none">px</span>
                        </div>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={shadowOptions.offsetX}
                            onChange={(e) => handleApplyShadow({ offsetX: parseInt(e.target.value) })}
                            className="mus-tool-range flex-1"
                        />
                    </div>
                </div>

                {/* Offset Y Slider */}
                <div className="space-y-2">
                    <span className="mus-tool-label !text-primary">Offset Y</span>
                    <div className="flex items-center gap-3">
                        <div className="mus-tool-badge w-12 h-7 flex items-center justify-center gap-0.5 flex-shrink-0 px-2">
                            <DelayedInput
                                value={shadowOptions.offsetY}
                                isNumeric={true}
                                min="-100"
                                max="100"
                                onChange={(val) => handleApplyShadow({ offsetY: parseInt(val) || 0 })}
                                className="mus-tool-input-pure !text-[10px] !text-right w-full"
                            />
                            <span className="text-[9px] font-extrabold text-[#7A7062] select-none">px</span>
                        </div>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={shadowOptions.offsetY}
                            onChange={(e) => handleApplyShadow({ offsetY: parseInt(e.target.value) })}
                            className="mus-tool-range flex-1"
                        />
                    </div>
                </div>
            </div>
        </CollapsibleToolSection>
    );
};

export default ShadowTool;
