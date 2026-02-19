import React from 'react';

const CanvasTools = ({ canvas }) => {
    const handleBackgroundColor = (e) => {
        if (!canvas) return;
        canvas.set('backgroundColor', e.target.value);
        canvas.requestRenderAll();
    };

    return (
        <div className="space-y-4">
            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Canvas Settings</h3>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                    <span className="text-[10px] font-medium text-zinc-500">Background</span>
                    <input
                        type="color"
                        onInput={handleBackgroundColor}
                        className="w-6 h-6 rounded-md border-none cursor-pointer"
                    />
                </div>
            </section>
        </div>
    );
};

export default CanvasTools;
