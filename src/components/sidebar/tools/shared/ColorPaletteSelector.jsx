import React from 'react';
import PremiumColorPicker from './PremiumColorPicker';
import { useCanvasContext } from '../../../../context/CanvasContext';

const MAX_SWATCHES = 13;

const ColorPaletteSelector = ({ color = "#1DFF2D", onChange }) => {
    const { swatches, addSwatch } = useCanvasContext();

    return (
        <div className="space-y-6">
            <PremiumColorPicker color={color} onChange={onChange} />

            <div className="space-y-3 pt-4 border-t border-zinc-100">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Recent Colors</span>

                <div className="flex flex-wrap gap-2">
                    {swatches.map((swatch, index) => (
                        <button
                            key={`${swatch}-${index}`}
                            onClick={() => onChange(swatch)}
                            className={`w-6 h-6 rounded-full border border-zinc-200 shadow-sm transition-transform hover:scale-110 active:scale-95 ${color === swatch ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                            style={{ backgroundColor: swatch }}
                            title={swatch}
                        />
                    ))}

                    {swatches.length < MAX_SWATCHES && (
                        <button
                            onClick={() => addSwatch(color)}
                            className="w-6 h-6 rounded-full border-2 border-dashed border-zinc-300 text-zinc-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center justify-center"
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
