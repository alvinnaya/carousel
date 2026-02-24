import React from 'react';
import { changeOpacity } from '../../../Helper/FabricHelper';
import { useCanvasContext } from '../../../../context/CanvasContext';

const OpacityTool = ({ activeObject }) => {
    const { canvas } = useCanvasContext();

    if (!activeObject) return null;

    const opacityVal = Math.round((activeObject.opacity || 0) * 100);

    return (
        <section className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Opacity</h3>
                <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
                    {opacityVal}%
                </span>
            </div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={activeObject.opacity ?? 1}
                onChange={(e) => changeOpacity(activeObject, parseFloat(e.target.value), canvas)}
                className="w-full h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
            />
        </section>
    );
};

export default OpacityTool;
