import React from 'react';
import PremiumColorPicker from './PremiumColorPicker';
import { useCanvasContext } from '../../../../context/CanvasContext';

const MAX_SWATCHES = 13;

const ColorPaletteSelector = ({ color = "#1DFF2D", onChange }) => {
    const { swatches, addSwatch } = useCanvasContext();

    return (
        <div className="space-y-6">
            <PremiumColorPicker color={color} onChange={onChange} />

            <div className="mus-tool-divider space-y-4">
                <span className="mus-color-label">Recent Colors</span>

                <div className="flex flex-wrap gap-2.5">
                    {swatches.map((swatch, index) => (
                        <button
                            key={`${swatch}-${index}`}
                            onClick={() => onChange(swatch)}
                            className={`w-6 h-6 mus-color-swatch ${color === swatch ? 'mus-color-swatch-active' : ''}`}
                            style={{ backgroundColor: swatch }}
                            title={swatch}
                        />
                    ))}

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
        </div>
    );
};

export default ColorPaletteSelector;
