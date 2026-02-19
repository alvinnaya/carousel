import React from 'react';
import { changeOpacity, deleteObject, bringToFront, sendToBack } from '../../Helper/FabricHelper';

const ImageTools = ({ canvas, activeObject }) => {
    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Image Options</h3>
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-zinc-500">Opacity</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            defaultValue={activeObject.opacity}
                            onChange={(e) => changeOpacity(activeObject, parseFloat(e.target.value), canvas)}
                            className="w-2/3 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                        />
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Arrangement</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => bringToFront(activeObject, canvas)}
                        className="flex-1 py-2 px-3 rounded-lg bg-zinc-50 border border-zinc-100 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-100"
                    >
                        Bring to Front
                    </button>
                    <button
                        onClick={() => sendToBack(activeObject, canvas)}
                        className="flex-1 py-2 px-3 rounded-lg bg-zinc-50 border border-zinc-100 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-100"
                    >
                        Send to Back
                    </button>
                </div>
            </section>

            <button
                onClick={() => deleteObject(activeObject, canvas)}
                className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-100 transition-colors"
            >
                Delete Image
            </button>
        </div>
    );
};

export default ImageTools;
