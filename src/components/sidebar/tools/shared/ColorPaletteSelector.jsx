import React, { useState } from 'react';
import PremiumColorPicker from './PremiumColorPicker';
import SmartDropdown from '../../../shared/SmartDropdown';
import { useCanvasContext } from '../../../../context/CanvasContext';
import { PREDEFINED_COLORS } from '../../../../utils/predefinedColors';

const MAX_SWATCHES = 13;

const ColorPaletteSelector = ({ color, onChange }) => {
    const { swatches, addSwatch, updateSwatch } = useCanvasContext();
    const [editingIndex, setEditingIndex] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [showMore, setShowMore] = useState(false);

    const handleSwatchClick = (swatchColor, index) => {
        if (activeIndex === index) {
            // Index matches, toggle dropdown
            setEditingIndex(editingIndex === index ? null : index);
        } else {
            // New index selected
            setActiveIndex(index);
            onChange(swatchColor);
            setEditingIndex(null);
        }
    };

    const handleColorChange = (index, newColor) => {
        onChange(newColor);
        updateSwatch(index, newColor);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2.5">
                {swatches.map((swatch, index) => {
                    const isActive = activeIndex === index;
                    const isEditing = editingIndex === index;

                    const SwatchButton = (
                        <button
                            key={`${swatch}-${index}`}
                            onClick={() => handleSwatchClick(swatch, index)}
                            className={`w-4 h-4 mus-color-swatch ${isActive ? 'mus-color-swatch-active' : ''}`}
                            style={{ backgroundColor: swatch }}
                            title={isActive ? "Click again to edit" : swatch}
                        />
                    );

                    return (
                        <div key={`swatch-item-${index}`}>
                            <SmartDropdown
                                isOpen={isEditing}
                                onClose={() => setEditingIndex(null)}
                                trigger={SwatchButton}
                                className="w-72"
                            >
                                <div className="p-1">
                                    <PremiumColorPicker
                                        color={swatch}
                                        onChange={(newColor) => handleColorChange(index, newColor)}
                                    />
                                </div>
                            </SmartDropdown>
                        </div>
                    );
                })}

                {swatches.length < MAX_SWATCHES && (
                    <button
                        onClick={() => addSwatch(color)}
                        className="w-6 h-6 mus-color-swatch-add flex items-center justify-center"
                        title="Add current color"
                    >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Advanced Palette Toggle */}
            <div className="pt-2 border-t mus-border-light">
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex items-center gap-2 group cursor-pointer transition-colors"
                >
                    <span className="mus-tool-label !p-0" style={{ color: showMore ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        Advanced Palette
                    </span>
                    <svg
                        className={`w-3 h-3 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" fill="none"
                        stroke="var(--text-muted)"
                        strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>

                {showMore && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1 animate-in fade-in slide-in-from-top-2 duration-300">
                        {PREDEFINED_COLORS.map((row, i) => (
                            <div key={`color-row-${i}`} className="flex gap-1.5 justify-between">
                                {row.map((c, j) => (
                                    <button
                                        key={`color-${i}-${j}`}
                                        onClick={() => {
                                            onChange(c);
                                            addSwatch(c);
                                        }}
                                        className="w-4 h-4 rounded-full border border-black/10 hover:scale-125 hover:z-10 hover:shadow-md active:scale-90 transition-all duration-150"
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColorPaletteSelector;
