import React, { useState } from 'react';
import PremiumColorPicker from './PremiumColorPicker';
import SmartDropdown from '../../../shared/SmartDropdown';
import { useCanvasContext } from '../../../../context/CanvasContext';

const MAX_SWATCHES = 13;

const ColorPaletteSelector = ({ onChange }) => {
    const { swatches, addSwatch, updateSwatch } = useCanvasContext();
    const [editingIndex, setEditingIndex] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);

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
                            className={`w-6 h-6 mus-color-swatch ${isActive ? 'mus-color-swatch-active' : ''}`}
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
        </div>
    );
};

export default ColorPaletteSelector;
