import React, { useEffect, useState, useRef } from 'react';
import * as fabric from 'fabric';
import { useCanvasContext } from '../../../../../context/CanvasContext';
import { FILTER_CATEGORIES } from './constants';

const NoneIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);

const ChevronLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ChevronRight = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const PresetFilters = ({ isCustomActive, activeFilterLabel, handleSelectPreset, imageSrc, activeObject }) => {
    const { activeObjectSrc } = useCanvasContext();
    const [thumbnails, setThumbnails] = useState({});
    const generationRef = useRef(0);
    const scrollRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const allFilters = FILTER_CATEGORIES.flatMap(c => c.filters);

    // ── Generate thumbnails using Fabric ──────────────────────────────────────
    useEffect(() => {
        if (!activeObject || !activeObjectSrc) {
            setThumbnails({});
            return;
        }

        const currentGen = ++generationRef.current;
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = 100;
        offscreenCanvas.height = 100;
        const fCanvas = new fabric.StaticCanvas(offscreenCanvas);

        const generateAll = async () => {
            try {
                // Load the natural image directly into a Fabric Image
                const clonedImg = await fabric.Image.fromURL(activeObjectSrc, { crossOrigin: 'anonymous' });
                
                const bbox = clonedImg.getBoundingRect();
                const scale = Math.min(100 / bbox.width, 100 / bbox.height);
                
                clonedImg.set({
                    scaleX: clonedImg.scaleX * scale,
                    scaleY: clonedImg.scaleY * scale,
                    left: 50,
                    top: 50,
                    originX: 'center',
                    originY: 'center',
                    angle: 0
                });
                
                fCanvas.add(clonedImg);

                const newThumbs = {};
                for (const filter of allFilters) {
                    if (currentGen !== generationRef.current) return;
                    
                    if (filter.name === 'None') {
                        newThumbs['None'] = null;
                        continue;
                    }

                    const fVals = filter.fabricValues || {};
                    const filters = [];
                    
                    if (fVals.brightness !== undefined && fVals.brightness !== 0) 
                        filters.push(new fabric.filters.Brightness({ brightness: fVals.brightness }));
                    if (fVals.contrast !== undefined && fVals.contrast !== 0) 
                        filters.push(new fabric.filters.Contrast({ contrast: fVals.contrast }));
                    if (fVals.saturation !== undefined && fVals.saturation !== 0) 
                        filters.push(new fabric.filters.Saturation({ saturation: fVals.saturation }));
                    if (fVals.hue !== undefined && fVals.hue !== 0) 
                        filters.push(new fabric.filters.HueRotation({ rotation: (fVals.hue / 360) * Math.PI * 2 }));
                    if (fVals.blur !== undefined && fVals.blur > 0) 
                        filters.push(new fabric.filters.Blur({ blur: fVals.blur }));

                    clonedImg.filters = filters;
                    clonedImg.applyFilters();
                    fCanvas.renderAll();
                    
                    newThumbs[filter.name] = fCanvas.toDataURL({ format: 'jpeg', quality: 0.8 });
                    
                    if (currentGen === generationRef.current) {
                        setThumbnails(prev => ({ ...prev, [filter.name]: newThumbs[filter.name] }));
                    }
                }
            } catch (err) {
                console.error('PresetFilters generation failed:', err);
            }
        };

        generateAll();
        return () => fCanvas.dispose();
    }, [imageSrc]);

    // ── Scroll Handling ───────────────────────────────────────────────────────
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = 180;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Scroll Container */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    overflowX: 'auto', 
                    padding: '4px 2px',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    scrollSnapType: 'x mandatory',
                }}
                className="hide-scrollbar"
            >
                {allFilters.map((filter) => {
                    const isActive = !isCustomActive && activeFilterLabel === filter.name;
                    const isNone = filter.name === 'None';
                    const thumbUrl = thumbnails[filter.name];
                    
                    return (
                        <button
                            key={filter.name}
                            onClick={() => handleSelectPreset(filter.name)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0,
                                width: '82px',
                                scrollSnapAlign: 'start',
                            }}
                        >
                            {/* Thumbnail */}
                            <div style={{
                                width: '100%',
                                aspectRatio: '1 / 1',
                                borderRadius: '14px',
                                overflow: 'hidden',
                                position: 'relative',
                                border: isActive ? '3.5px solid var(--accent)' : '1px solid var(--border-light)',
                                padding: isActive ? '2px' : '0',
                                backgroundColor: isActive ? 'white' : 'transparent',
                                transition: 'all 0.2s ease',
                                boxShadow: isActive ? '0 4px 12px rgba(232, 192, 74, 0.2)' : 'none',
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    backgroundColor: 'var(--bg-card)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {isNone ? (
                                        <div style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                                            <NoneIcon />
                                        </div>
                                    ) : thumbUrl ? (
                                        <img 
                                            src={thumbUrl} 
                                            alt={filter.name} 
                                            draggable={false}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                                filter: isActive ? 'none' : 'brightness(0.95)',
                                            }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div className="animate-spin w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Label */}
                            <span style={{
                                fontSize: '11px',
                                fontWeight: isActive ? 800 : 600,
                                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                textAlign: 'center',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                            }}>
                                {filter.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Navigation Arrows */}
            {showLeftArrow && (
                <button 
                    onClick={() => scroll('left')}
                    style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '41px',
                        transform: 'translateY(-50%)',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-surface)',
                        boxShadow: '2px 2px 0px 0px var(--border-dark)',
                        border: '1px solid var(--border-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        color: 'var(--text-primary)',
                    }}
                >
                    <ChevronLeft />
                </button>
            )}
            {showRightArrow && (
                <button 
                    onClick={() => scroll('right')}
                    style={{
                        position: 'absolute',
                        right: '-8px',
                        top: '41px',
                        transform: 'translateY(-50%)',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-surface)',
                        boxShadow: '2px 2px 0px 0px var(--border-dark)',
                        border: '1px solid var(--border-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        color: 'var(--text-primary)',
                    }}
                >
                    <ChevronRight />
                </button>
            )}
        </div>
    );
};

export default PresetFilters;
