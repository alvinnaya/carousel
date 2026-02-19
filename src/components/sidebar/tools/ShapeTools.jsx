import React from 'react';
import { changeColor, deleteObject, updateObjectProperty } from '../../Helper/FabricHelper';

const ShapeTools = ({ canvas, activeObject }) => {
    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Shape Style</h3>
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-zinc-500">Fill Color</span>
                        <input
                            type="color"
                            defaultValue={activeObject.fill}
                            onInput={(e) => changeColor(activeObject, e.target.value, canvas)}
                            className="w-6 h-6 rounded border-none cursor-pointer"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-zinc-500">Corner Radius</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue={activeObject.rx}
                            onChange={(e) => {
                                updateObjectProperty(activeObject, 'rx', parseInt(e.target.value), canvas);
                                updateObjectProperty(activeObject, 'ry', parseInt(e.target.value), canvas);
                            }}
                            className="w-2/3 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                        />
                    </div>
                </div>
            </section>

            <button
                onClick={() => deleteObject(activeObject, canvas)}
                className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-100 transition-colors"
            >
                Delete Shape
            </button>
        </div>
    );
};

export default ShapeTools;
