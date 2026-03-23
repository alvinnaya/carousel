import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useCanvasContext } from '../../../../../context/CanvasContext';
import { changeImageCustomFilter } from '../../../../Helper/FabricHelper';

import { ALL_PRESET_FILTERS, toFabric, ALL_SLIDERS, getEffectiveFilters } from './constants';
import PresetFilters from './PresetFilters';
import CollapsibleToolSection from '../CollapsibleToolSection';

const ImageFilterTool = ({ activeObject }) => {
    const { canvas, setActiveSubView, setActiveObjectSrc } = useCanvasContext();
    const [activePreset, setActivePreset] = useState('None');
    const [intensity, setIntensity] = useState(100);
    const [imageSrc, setImageSrc] = useState(null);

    const isImage = activeObject &&
        (activeObject.type === 'image' ||
            activeObject.type === 'FabricImage' ||
            (activeObject.constructor && activeObject.constructor.name === 'FabricImage'));

    // ── Sync state from active object ─────────────────────────────────────────
    useEffect(() => {
        if (!isImage || !activeObject) {
            setImageSrc(null); 
            setActiveObjectSrc(null);
            setActivePreset('None'); 
            setIntensity(100);
            return;
        }

        const preset = activeObject._filterPreset || activeObject.customFilter || 'None';
        const power = activeObject._filterIntensity ?? 100;

        setActivePreset(preset);
        setIntensity(power);

        // Robust image src fallback chain
        let src = null;
        try { if (typeof activeObject.getSrc === 'function') src = activeObject.getSrc(); } catch (_) { }
        if (!src) {
            const el = activeObject._element ?? activeObject.getElement?.();
            if (el) src = el.src || el.currentSrc || null;
        }
        if (!src) {
            try {
                const el = activeObject._element ?? activeObject.getElement?.();
                if (el && (el.naturalWidth || el.width)) {
                    const tmp = document.createElement('canvas');
                    tmp.width = el.naturalWidth || el.width || 200;
                    tmp.height = el.naturalHeight || el.height || 200;
                    tmp.getContext('2d').drawImage(el, 0, 0);
                    src = tmp.toDataURL();
                }
            } catch (_) { }
        }
        setImageSrc(src || null);
        setActiveObjectSrc(src || null);
    }, [activeObject, isImage, setActiveObjectSrc]);

    if (!isImage) return null;

    // ── Handlers ───────────────────────────────────────────────────────────────

    const applyFilter = useCallback((presetName, power) => {
        if (presetName === 'None') {
            changeImageCustomFilter(activeObject, {}, canvas);
            return;
        }
        const merged = getEffectiveFilters(presetName, power);
        changeImageCustomFilter(activeObject, merged, canvas);
    }, [activeObject, canvas]);

    const handleSelectPreset = (presetName) => {
        setActivePreset(presetName);
        // Reset intensity when picking a new one? Or keep?
        // Mockup shows intensity slider, maybe keep current intensity but default it to 100 for a fresh pick.
        // setIntensity(100); 
        applyFilter(presetName, intensity);

        // Save metadata on object
        activeObject._filterPreset = presetName;
        activeObject._filterIntensity = intensity;
    };

    const handleIntensityChange = (val) => {
        const power = parseInt(val);
        setIntensity(power);
        applyFilter(activePreset, power);

        // Save metadata
        activeObject._filterIntensity = power;
    };

    const lihatSemuaBtn = (
        <button
            className="text-[10px] font-bold text-muted-foreground hover:underline transition-all"
            onClick={(e) => {
                e.stopPropagation();
                setActiveSubView('FILTER_LIST');
            }}
        >
            Lihat semua
        </button>
    );

    return (
        <CollapsibleToolSection title="Filter" actionButton={lihatSemuaBtn}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <PresetFilters
                activeFilterLabel={activePreset}
                isCustomActive={false}
                handleSelectPreset={handleSelectPreset}
                imageSrc={imageSrc}
                activeObject={activeObject}
            />

            {/* Intensity Slider */}
            {activePreset !== 'None' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.25rem' }}>
                    <div className="flex items-center justify-between">
                        <span className="mus-tool-label !mb-0 !text-sm !font-bold">Intensitas</span>
                        <span className="text-[11px] font-bold text-zinc-400">{intensity}%</span>
                    </div>

                    <div className="relative group">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={intensity}
                            onChange={(e) => handleIntensityChange(e.target.value)}
                            className="mus-tool-range w-full"
                        />
                    </div>
                </div>
            )}
            </div>
        </CollapsibleToolSection>
    );
};

export default ImageFilterTool;
