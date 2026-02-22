import React from 'react';

const CanvasTools = ({ canvas }) => {
    const handleBackgroundColor = (e) => {
        if (!canvas) return;
        canvas.set('backgroundColor', e.target.value);
        canvas.requestRenderAll();
    };

    return (
        <div className="space-y-6">
            <section className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Canvas Settings</h3>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-100/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-700">Background Color</span>
                        <span className="text-[9px] text-zinc-400 font-medium">Click to change</span>
                    </div>
                    <input
                        type="color"
                        onInput={handleBackgroundColor}
                        className="w-10 h-10 rounded-lg border-2 border-white shadow-sm cursor-pointer outline-none ring-1 ring-zinc-200"
                    />
                </div>
            </section>
        </div>
    );
};

export default CanvasTools;
