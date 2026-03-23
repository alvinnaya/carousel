import React, { useState, useEffect, useRef } from 'react';
import ColorPaletteSelector from './ColorPaletteSelector';
import SmartDropdown from '../../../shared/SmartDropdown';

const GradientEditor = ({ value, onChange }) => {
    // Default fallback state if invalid map
    const defaultGradient = {
        type: 'linear',
        angle: 90,
        stops: [
            { offset: 0, color: '#facc15' },
            { offset: 1, color: '#e11d48' }
        ]
    };

    const gradient = value || defaultGradient;
    
    const [activeStopIndex, setActiveStopIndex] = useState(null);
    const trackRef = useRef(null);
    const dialRef = useRef(null);

    // CSS generation helper
    const generateCssGradient = (grad, overrideAngle = null) => {
        const sortedStops = [...grad.stops].sort((a, b) => a.offset - b.offset);
        const stopsString = sortedStops.map(s => `${s.color} ${s.offset * 100}%`).join(', ');
        const ang = overrideAngle !== null ? overrideAngle : grad.angle;
        return `linear-gradient(${ang}deg, ${stopsString})`;
    };

    // ── Handle dragging stops ─────────────────────────────────────────────
    const handleStopMouseDown = (e, index) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault();
        setActiveStopIndex(index);
        
        let startX = e.clientX;
        const startOffset = gradient.stops[index].offset;
        const trackWidth = trackRef.current ? trackRef.current.getBoundingClientRect().width : 100;

        const handleMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            let newOffset = startOffset + (dx / trackWidth);
            newOffset = Math.max(0, Math.min(1, newOffset));
            const newStops = [...gradient.stops];
            newStops[index] = { ...newStops[index], offset: newOffset };
            onChange({ ...gradient, stops: newStops });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // ── Track Click: add new stop ─────────────────────────────────────────
    const handleTrackClick = (e) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        let newOffset = clickX / rect.width;
        newOffset = Math.max(0, Math.min(1, newOffset));

        let closest = gradient.stops.reduce((prev, curr) => Math.abs(curr.offset - newOffset) < Math.abs(prev.offset - newOffset) ? curr : prev);
        const newStop = { offset: newOffset, color: closest.color };
        const newStops = [...gradient.stops, newStop].sort((a,b) => a.offset - b.offset);
        const newIndex = newStops.findIndex(s => s === newStop);
        
        onChange({ ...gradient, stops: newStops });
        setActiveStopIndex(newIndex);
    };

    // ── Delete stop ───────────────────────────────────────────────────────
    const handleDeleteStop = (index) => {
        if (gradient.stops.length <= 2) return;
        const newStops = gradient.stops.filter((_, i) => i !== index);
        onChange({ ...gradient, stops: newStops });
        setActiveStopIndex(null);
    };

    // ── Angle Drag ────────────────────────────────────────────────────────
    const handleDialMouseDown = (e) => {
        e.preventDefault();
        if (!dialRef.current) return;
        const rect = dialRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const handleMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - centerX;
            const dy = centerY - moveEvent.clientY;
            let deg = (Math.atan2(dx, dy) * 180) / Math.PI;
            if (deg < 0) deg += 360;
            onChange({ ...gradient, angle: Math.round(deg) });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        handleMouseMove(e); 
    };

    return (
        <section className="space-y-3">
            <h3 className="mus-tool-label !p-0">Gradient Editor</h3>

            {/* Top row: Preview & Track */}
            <div className="flex items-center gap-3">
                <div 
                    className="w-8 h-8 rounded-lg shadow-inner shrink-0 mus-color-box border-2 border-zinc-200"
                    style={{ background: generateCssGradient(gradient) }}
                />

                <div 
                    className="relative flex-1 h-2.5 rounded-full cursor-pointer border border-zinc-200 shadow-inner group"
                    style={{ background: generateCssGradient(gradient, 90) }} 
                    ref={trackRef}
                    onClick={handleTrackClick}
                >
                    {gradient.stops.map((stop, i) => {
                        const isActive = i === activeStopIndex;
                        return (
                            <div
                                key={i}
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                                style={{
                                    left: `${stop.offset * 100}%`,
                                    zIndex: isActive ? 50 : 10
                                }}
                            >
                                <SmartDropdown
                                    isOpen={isActive}
                                    onClose={() => setActiveStopIndex(null)}
                                    className="w-[260px]"
                                    trigger={
                                        <div
                                            onMouseDown={(e) => handleStopMouseDown(e, i)}
                                            onDoubleClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStop(i);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`w-3.5 h-3.5 rounded-full border-2 cursor-grab active:cursor-grabbing hover:scale-125 transition-transform shadow-md ${isActive ? 'border-amber-400 scale-125 ring-2 ring-amber-400/30' : 'border-white'}`}
                                            style={{ backgroundColor: stop.color }}
                                            title="Drag to move. Double click to delete."
                                        />
                                    }
                                >
                                    <div className="p-1.5 space-y-2">
                                        <div className="flex items-center justify-between border-b border-zinc-200/50 pb-1.5">
                                            <span className="mus-tool-label !p-0 !text-[9px]">Stop Color</span>
                                            <div className="flex gap-1.5 items-center">
                                                <span className="text-[9px] font-mono text-zinc-500 bg-white px-1 py-0.5 rounded border border-zinc-200">
                                                    {Math.round(stop.offset * 100)}%
                                                </span>
                                                {gradient.stops.length > 2 && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteStop(i);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0.5 rounded transition-colors"
                                                        title="Delete Stop"
                                                    >
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <ColorPaletteSelector
                                            color={stop.color}
                                            onChange={(c) => {
                                                const newStops = [...gradient.stops];
                                                newStops[i] = { ...newStops[i], color: c };
                                                onChange({ ...gradient, stops: newStops });
                                            }}
                                        />
                                    </div>
                                </SmartDropdown>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Angle Dial & Settings */}
            <div className="pt-2 border-t mus-border-light flex gap-4">
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <span className="mus-tool-label font-bold text-[8px]">Angle:</span>
                        <span className="text-[9px] font-mono text-zinc-500">{gradient.angle}°</span>
                    </div>
                    
                    <div 
                        ref={dialRef}
                        onMouseDown={handleDialMouseDown}
                        className="w-12 h-12 rounded-full border-2 border-zinc-200 relative cursor-crosshair hover:border-zinc-300 transition-colors shadow-inner mx-auto group bg-white"
                    >
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-zinc-100 -translate-x-1/2" />
                        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-zinc-100 -translate-y-1/2" />
                        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-zinc-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div 
                            className="absolute top-1/2 left-1/2 w-[1px] h-[40%] bg-zinc-800 origin-bottom rounded-full"
                            style={{ transform: `translate(-50%, -100%) rotate(${gradient.angle}deg)` }}
                        >
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 border border-zinc-800 shadow-sm" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                     <span className="mus-tool-label font-bold text-[8px] mb-0.5">Type</span>
                     <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 shadow-inner">
                        <button 
                            onClick={() => onChange({ ...gradient, type: 'linear' })}
                            className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all ${gradient.type === 'linear' ? 'bg-white shadow-sm text-zinc-900 border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >Linear</button>
                        <button 
                            onClick={() => onChange({ ...gradient, type: 'radial' })}
                            className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all ${gradient.type === 'radial' ? 'bg-white shadow-sm text-zinc-900 border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >Radial</button>
                     </div>
                </div>
            </div>
        </section>
    );
};

export default GradientEditor;
