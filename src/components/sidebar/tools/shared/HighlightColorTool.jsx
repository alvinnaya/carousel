import React, { useState, useEffect } from 'react';
import ColorPaletteSelector from './ColorPaletteSelector';
import { changeSelectedTextProperty, getTextSelection } from '../../../Helper/FabricHelper';
import { useCanvasContext } from '../../../../context/CanvasContext';

const HighlightColorTool = ({ activeObject }) => {
    const { canvas, canvases } = useCanvasContext();
    const [highlight, setHighlight] = useState('transparent');

    const getDisplayProp = (prop, fallback) => {
        if (!activeObject) return fallback;
        const selection = getTextSelection(activeObject);
        if (selection.hasSelection) {
            const styles = activeObject.getSelectionStyles(selection.start, selection.start + 1);
            if (styles && styles.length > 0 && styles[0][prop] !== undefined) {
                return styles[0][prop];
            }
        }
        return activeObject[prop] ?? fallback;
    };

    useEffect(() => {
        if (!activeObject) return;

        const currentHighlight = getDisplayProp('textBackgroundColor', 'transparent');
        setHighlight(currentHighlight);
    }, [canvas, activeObject, canvases]);

    const applyHighlight = (color) => {
        if (!activeObject) return;
        changeSelectedTextProperty(activeObject, 'textBackgroundColor', color, canvas);
        setHighlight(color);
    };

    return (
        <section className="mus-tool-section">
            <div className="flex items-center justify-between">
                <span className="mus-tool-label !text-primary">Highlight</span>
                <div
                    className="mus-color-swatch w-6 h-6 border-2 border-dashed border-zinc-300 relative overflow-hidden"
                    style={{ backgroundColor: highlight === 'transparent' ? 'transparent' : highlight }}
                >
                    {highlight === 'transparent' && (
                        <div className="absolute inset-0 bg-white">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 rotate-45 origin-top-left scale-x-[1.5]" />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2.5">
                {/* "None" switch */}
                <button
                    onClick={() => applyHighlight('transparent')}
                    className={`w-6 h-6 mus-color-swatch-none shrink-0 ${highlight === 'transparent' ? 'mus-color-swatch-active' : ''}`}
                    title="No Highlight"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[120%] h-[2px] bg-red-500 rotate-45" />
                    </div>
                </button>

                <div className="flex-1">
                    <ColorPaletteSelector
                        color={highlight}
                        onChange={applyHighlight}
                    />
                </div>
            </div>
        </section>
    );
};

export default HighlightColorTool;
