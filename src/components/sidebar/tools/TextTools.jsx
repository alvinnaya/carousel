import React from 'react';
import { updateObjectProperty, deleteObject } from '../../Helper/FabricHelper';

const TextTools = ({ canvas, activeObject }) => {
    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Text Styling</h3>
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-zinc-500">Font Size</span>
                        <input
                            type="number"
                            defaultValue={activeObject.fontSize}
                            onChange={(e) => updateObjectProperty(activeObject, 'fontSize', parseInt(e.target.value), canvas)}
                            className="w-16 p-1 rounded border border-zinc-200 text-xs"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-zinc-500">Color</span>
                        <input
                            type="color"
                            defaultValue={activeObject.fill}
                            onInput={(e) => updateObjectProperty(activeObject, 'fill', e.target.value, canvas)}
                            className="w-6 h-6 rounded border-none cursor-pointer"
                        />
                    </div>
                </div>
            </section>

            <button
                onClick={() => deleteObject(activeObject, canvas)}
                className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-100 transition-colors"
            >
                Delete Text
            </button>
        </div>
    );
};

export default TextTools;
