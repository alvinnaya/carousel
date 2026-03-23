import React, { useState } from 'react';
import SmartDropdown from '../../../shared/SmartDropdown';
import GradientEditor from './GradientEditor';
import { useCanvasContext } from '../../../../context/CanvasContext';

const generateCssGradient = (grad) => {
    if (!grad || !grad.stops) return 'none';
    const sortedStops = [...grad.stops].sort((a, b) => a.offset - b.offset);
    const stopsString = sortedStops.map(s => `${s.color} ${s.offset * 100}%`).join(', ');
    const ang = grad.angle !== undefined ? grad.angle : 90;
    if (grad.type === 'radial') return `radial-gradient(circle, ${stopsString})`;
    return `linear-gradient(${ang}deg, ${stopsString})`;
};

const GradientPaletteSelector = ({ activeGradient, onChange }) => {
    const { gradientSwatches, addGradientSwatch, updateGradientSwatch } = useCanvasContext();
    const [editingIndex, setEditingIndex] = useState(null);

    const defaultGradient = {
        type: 'linear',
        angle: 90,
        stops: [
            { offset: 0, color: '#4facfe' },
            { offset: 1, color: '#00f2fe' }
        ]
    };

    const isGradientActive = (grad) => {
        if (!activeGradient || !grad) return false;
        // Deep compare stops and type/angle
        if (grad.type !== activeGradient.type) return false;
        if (grad.type === 'linear' && grad.angle !== activeGradient.angle) return false;
        if (grad.stops.length !== activeGradient.stops.length) return false;
        for (let i = 0; i < grad.stops.length; i++) {
            if (grad.stops[i].offset !== activeGradient.stops[i].offset) return false;
            if (grad.stops[i].color !== activeGradient.stops[i].color) return false;
        }
        return true;
    };

    const handleAddGradient = () => {
        const newGrad = JSON.parse(JSON.stringify(activeGradient || defaultGradient));
        addGradientSwatch(newGrad);
        setEditingIndex(gradientSwatches.length); // Use the length (new index will be the last one)
        onChange(newGrad);
    };

    const handleGradientUpdate = (newGrad) => {
        if (editingIndex !== null) {
            updateGradientSwatch(editingIndex, newGrad);
        }
        onChange(newGrad);
    };

    return (
        <div className="flex flex-wrap gap-1.5 items-center">
            {/* Swatches List */}
            {gradientSwatches.map((grad, i) => {
                const isActive = isGradientActive(grad);
                const isBeingEdited = editingIndex === i;

                return (
                    <div key={i}>
                        <SmartDropdown
                            isOpen={isBeingEdited}
                            onClose={() => setEditingIndex(null)}
                            className="w-[280px]"
                            trigger={
                                <button
                                    onClick={() => {
                                        if (isActive) {
                                            setEditingIndex(i);
                                        } else {
                                            onChange(grad);
                                        }
                                    }}
                                    className={`w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-all active:scale-90 mus-color-swatch ${isActive ? 'ring-2 ring-primary ring-offset-1 scale-110 shadow-md' : 'opacity-90 hover:opacity-100'}`}
                                    style={{ background: generateCssGradient(grad) }}
                                    title={isActive ? "Click again to edit" : "Click to apply"}
                                />
                            }
                        >
                            <div className="p-2">
                                <GradientEditor 
                                    value={gradientSwatches[i]} 
                                    onChange={handleGradientUpdate} 
                                />
                            </div>
                        </SmartDropdown>
                    </div>
                );
            })}

            {/* Add Button */}
            <button
                onClick={handleAddGradient}
                className="w-5 h-5 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-primary hover:text-primary transition-colors active:scale-90 shadow-sm bg-white"
                title="Add current as new swatch"
            >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>
    );
};

export default GradientPaletteSelector;
