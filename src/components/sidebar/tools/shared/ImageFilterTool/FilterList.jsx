import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as fabric from 'fabric';
import { useCanvasContext } from '../../../../../context/CanvasContext';
import { FILTER_CATEGORIES, ALL_PRESET_FILTERS, getEffectiveFilters } from './constants';
import { changeImageCustomFilter } from '../../../../Helper/FabricHelper';
import SidebarSubView from '../SidebarSubView';

const NoneIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);

const FilterList = ({ onBack }) => {
    const { canvas, activeObjectSrc } = useCanvasContext();
    const [thumbs, setThumbs] = useState({});
    const [activePreset, setActivePreset] = useState('None');
    const [intensity, setIntensity] = useState(100);
    const generationRef = useRef(0);
    const activeObject = canvas?.getActiveObject();

    useEffect(() => {
        if (!activeObject) return;
        setActivePreset(activeObject._filterPreset || 'None');
        setIntensity(activeObject._filterIntensity ?? 100);
    }, [activeObject]);

    // Generate thumbnails using Fabric.js — identical pipeline to the canvas
    useEffect(() => {
        if (!activeObjectSrc) return;
        
        const currentGen = ++generationRef.current;
        const offscreen = document.createElement('canvas');
        offscreen.width = 100;
        offscreen.height = 100;
        const fCanvas = new fabric.StaticCanvas(offscreen);

        const generateAll = async () => {
            try {
                const img = await fabric.Image.fromURL(activeObjectSrc, { crossOrigin: 'anonymous' });
                
                const bbox = img.getBoundingRect();
                const scale = Math.min(100 / bbox.width, 100 / bbox.height);
                img.set({
                    scaleX: img.scaleX * scale,
                    scaleY: img.scaleY * scale,
                    left: 50, top: 50,
                    originX: 'center', originY: 'center',
                    angle: 0,
                });
                fCanvas.add(img);

                for (const filter of ALL_PRESET_FILTERS) {
                    if (currentGen !== generationRef.current) return;
                    if (filter.name === 'None') continue;

                    const fv = filter.fabricValues || {};
                    const filters = [];

                    if (fv.brightness) filters.push(new fabric.filters.Brightness({ brightness: fv.brightness }));
                    if (fv.contrast)   filters.push(new fabric.filters.Contrast({ contrast: fv.contrast }));
                    if (fv.saturation) filters.push(new fabric.filters.Saturation({ saturation: fv.saturation }));
                    if (fv.hue)        filters.push(new fabric.filters.HueRotation({ rotation: (fv.hue / 360) * Math.PI * 2 }));
                    if (fv.blur > 0)   filters.push(new fabric.filters.Blur({ blur: fv.blur }));
                    if (fv.noise > 0)  filters.push(new fabric.filters.Noise({ noise: fv.noise }));
                    if (fv.vibrance)   filters.push(new fabric.filters.Vibrance({ vibrance: fv.vibrance }));

                    img.filters = filters;
                    img.applyFilters();
                    fCanvas.renderAll();

                    const dataUrl = fCanvas.toDataURL({ format: 'jpeg', quality: 0.8 });
                    if (currentGen === generationRef.current) {
                        setThumbs(prev => ({ ...prev, [filter.name]: dataUrl }));
                    }
                }
            } catch (err) {
                console.error('FilterList thumb generation failed:', err);
            }
        };

        generateAll();
        return () => { fCanvas.dispose(); };
    }, [activeObjectSrc]);

    const applyFilter = useCallback((presetName, power) => {
        if (!activeObject) return;
        
        if (presetName === 'None') {
            changeImageCustomFilter(activeObject, {}, canvas);
        } else {
            const effectiveFilters = getEffectiveFilters(presetName, power);
            changeImageCustomFilter(activeObject, effectiveFilters, canvas);
        }
        
        setActivePreset(presetName);
        activeObject._filterPreset = presetName;
        activeObject._filterIntensity = power;
    }, [activeObject, canvas]);

    const handleIntensityChange = (val) => {
        const p = parseInt(val);
        setIntensity(p);
        applyFilter(activePreset, p);
    };

    if (!activeObject) return null;

    return (
        <SidebarSubView title="Filter" onBack={onBack}>
            <div className="p-4 space-y-8">
                {/* Standalone "None" (Tidak ada) */}
                <div className="space-y-4">
                    <button
                        onClick={() => applyFilter('None', intensity)}
                        className="flex flex-col items-center gap-2 group outline-none w-[31%]"
                    >
                        <div style={{
                            width: '100%',
                            aspectRatio: '1/1',
                            borderRadius: '12px',
                            border: activePreset === 'None' ? '3px solid var(--accent)' : '1px solid var(--border-light)',
                            padding: activePreset === 'None' ? '2px' : '0',
                            backgroundColor: activePreset === 'None' ? 'white' : 'transparent',
                            transition: 'all 0.15s ease-out',
                            boxShadow: activePreset === 'None' ? '4px 4px 0px 0px var(--border-dark)' : 'none',
                            transform: activePreset === 'None' ? 'translate(-2px, -2px)' : 'none'
                        }}>
                            <div className="w-full h-full rounded-[8px] overflow-hidden bg-[var(--bg-surface)] flex items-center justify-center">
                                <div className="text-zinc-300">
                                    <NoneIcon />
                                </div>
                            </div>
                        </div>
                        <span className={`text-[10px] font-bold text-center leading-tight truncate w-full ${activePreset === 'None' ? 'text-primary' : 'text-muted-foreground'}`}>
                            Tidak ada
                        </span>
                    </button>
                </div>

                {/* Categorized Grid with Dynamic Slider */}
                {FILTER_CATEGORIES.map(category => {
                    // Chunk filters into rows of 3
                    const filters = category.filters.filter(f => f.name !== 'None');
                    const rows = [];
                    for (let i = 0; i < filters.length; i += 3) {
                        rows.push(filters.slice(i, i + 3));
                    }

                    return (
                        <div key={category.name} className="space-y-4">
                            <h4 className="mus-tool-label !text-[11px] !font-black !text-primary uppercase tracking-widest">{category.name}</h4>
                            
                            <div className="space-y-6">
                                {rows.map((row, rowIndex) => {
                                    const hasActive = row.some(f => f.name === activePreset);
                                    
                                    return (
                                        <React.Fragment key={rowIndex}>
                                            <div className="grid grid-cols-3 gap-x-3">
                                                {row.map(filter => {
                                                    const isActive = activePreset === filter.name;
                                                    const thumbUrl = thumbs[filter.name];

                                                    return (
                                                        <button
                                                            key={filter.name}
                                                            onClick={() => applyFilter(filter.name, intensity)}
                                                            className="flex flex-col items-center gap-2 group outline-none"
                                                        >
                                                            <div style={{
                                                                width: '100%',
                                                                aspectRatio: '1/1',
                                                                borderRadius: '12px',
                                                                border: isActive ? '3px solid var(--accent)' : '1px solid var(--border-light)',
                                                                padding: isActive ? '2px' : '0',
                                                                backgroundColor: isActive ? 'white' : 'transparent',
                                                                transition: 'all 0.15s ease-out',
                                                                boxShadow: isActive ? '4px 4px 0px 0px var(--border-dark)' : 'none',
                                                                transform: isActive ? 'translate(-2px, -2px)' : 'none'
                                                            }}>
                                                                <div className="w-full h-full rounded-[8px] overflow-hidden bg-[var(--bg-surface)] flex items-center justify-center">
                                                                    {thumbUrl ? (
                                                                        <img 
                                                                            src={thumbUrl} 
                                                                            alt={filter.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="animate-pulse w-full h-full bg-zinc-100" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className={`text-[10px] font-bold text-center leading-tight truncate w-full ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                {filter.name}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Slider shows up here if an item in THIS row is active */}
                                            {hasActive && (
                                                <div className="space-y-3 py-4 border-y border-[var(--border-light)] bg-[var(--bg-surface)] -mx-4 px-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="mus-tool-label !mb-0 !text-[10px] !font-black !text-primary uppercase tracking-widest">Intensitas</span>
                                                        <span className="text-[10px] font-bold text-zinc-400">{intensity}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={intensity}
                                                        onChange={(e) => handleIntensityChange(e.target.value)}
                                                        className="mus-tool-range w-full"
                                                    />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </SidebarSubView>
    );
};

export default FilterList;
