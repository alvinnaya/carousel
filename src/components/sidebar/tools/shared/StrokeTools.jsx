import React, { useEffect, useState } from 'react';
import DelayedInput from './DelayedInput';
import ColorPaletteSelector from './ColorPaletteSelector';
import { useCanvasContext } from '../../../../context/CanvasContext';
import {
    changeStroke,
    changeStrokeWidth,
    changeStrokeAlign,
    changeSelectedTextProperty,
    getTextSelection
} from '../../../Helper/FabricHelper';

const StrokeTools = ({ activeObject }) => {
    const { canvas } = useCanvasContext();
    const [stroke, setStroke] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(0);

    const getDisplayProp = (prop, fallback) => {
        if (!activeObject) return fallback;
        const selection = getTextSelection(activeObject);
        if (selection.hasSelection) {
            const styles = activeObject.getSelectionStyles(selection.start, selection.start + 1);
            if (styles && styles.length > 0 && styles[0][prop] !== undefined) {
                return styles[0][prop];
            }
        }

        const isImage = activeObject.type === 'image' || activeObject.type === 'FabricImage' || (activeObject.constructor && activeObject.constructor.name === 'FabricImage');
        if (isImage && activeObject.clipPath) {
            return activeObject.clipPath[prop] ?? fallback;
        }

        return activeObject[prop] ?? fallback;
    };

    useEffect(() => {
        if (!activeObject || !canvas) return;

        const updateState = () => {
            let currentStroke = getDisplayProp('stroke', null);
            // If stroke is null or "undefined", it might mean no stroke.
            // But we want to show it as #000000 if we are about to apply one.
            setStroke(currentStroke || '#000000');
            setStrokeWidth(getDisplayProp('strokeWidth', 0));
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

    const applyStroke = (color) => {
        if (!activeObject) return;
        const selection = getTextSelection(activeObject);
        if (selection.hasSelection) {
            changeSelectedTextProperty(activeObject, 'stroke', color, canvas);
            // Character-level strokeAlign is often not fully supported or needed for 'outside'
            // but we ensure the object at least has it if possible.
            if (!activeObject.strokeAlign || activeObject.strokeAlign !== 'outside') {
                activeObject.set('strokeAlign', 'outside');
            }
        } else {
            changeStroke(activeObject, color, canvas);
        }
        setStroke(color);
    };

    const applyStrokeWidth = (width) => {
        if (!activeObject) return;
        const selection = getTextSelection(activeObject);
        const numWidth = parseFloat(width) || 0;
        if (selection.hasSelection) {
            changeSelectedTextProperty(activeObject, 'strokeWidth', numWidth, canvas);
            if (activeObject.strokeAlign !== 'outside') {
                activeObject.set('strokeAlign', 'outside');
            }
        } else {
            changeStrokeWidth(activeObject, numWidth, canvas);
        }
        setStrokeWidth(numWidth);
    };

    const applyStrokeAlign = (align) => {
        if (!activeObject) return;
        const selection = getTextSelection(activeObject);
        if (selection.hasSelection) {
            changeSelectedTextProperty(activeObject, 'strokeAlign', align, canvas);
        } else {
            changeStrokeAlign(activeObject, align, canvas);
        }
        setStrokeAlign(align);
    };

    if (!activeObject) return null;

    const selection = getTextSelection(activeObject);

    return (
        <section className="mus-tool-section">
            <div className="flex items-center justify-between">
                <h3 className="mus-tool-label">Stroke</h3>
                {selection.hasSelection && (
                    <span className="mus-tool-badge-accent mus-tool-badge">
                        Selection Only
                    </span>
                )}
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <span className="mus-tool-label !text-primary">Color</span>
                    <div
                        className="mus-color-swatch w-6 h-6 border border-zinc-200"
                        style={{ backgroundColor: stroke }}
                    />
                </div>
                <ColorPaletteSelector
                    color={stroke}
                    onChange={applyStroke}
                />

                <div className="space-y-2">
                    <span className="mus-tool-label !text-primary">Width</span>
                    <div className="flex items-center gap-3">
                        <div className="mus-tool-badge w-12 h-7 flex items-center justify-center gap-0.5 flex-shrink-0 px-2">
                            <DelayedInput
                                value={strokeWidth}
                                isNumeric={true}
                                min="0"
                                max="100"
                                onChange={(val) => applyStrokeWidth(parseFloat(val) || 0)}
                                className="mus-tool-input-pure !text-[10px] !text-right w-full"
                            />
                            <span className="text-[9px] font-extrabold text-[#7A7062] select-none">px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={strokeWidth}
                            onChange={(e) => applyStrokeWidth(parseFloat(e.target.value))}
                            className="mus-tool-range flex-1"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StrokeTools;
