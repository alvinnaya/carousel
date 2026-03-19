import React, { useEffect, useState } from 'react';
import { useCanvasContext } from '../../../../context/CanvasContext';
import { changeImageFilter, changeImageCustomFilter } from '../../../Helper/FabricHelper';

// ─── Preset filters ───────────────────────────────────────────────────────────
const FILTERS = [
    { name: 'None', css: 'none' },
    { name: 'Grayscale', css: 'grayscale(100%)' },
    { name: 'Sepia', css: 'sepia(100%)' },
    { name: 'Vintage', css: 'sepia(60%) contrast(1.15)' },
    { name: 'Invert', css: 'invert(100%)' },
    { name: 'Blur', css: 'blur(2px)' },
    { name: 'Brightness', css: 'brightness(1.5)' },
    { name: 'Contrast', css: 'contrast(1.6)' },
    { name: 'Saturate', css: 'saturate(2.5)' },
];

// ─── Slider group definitions ─────────────────────────────────────────────────
// displayMin/displayMax = what the slider shows to user
// fabricDefault         = what Fabric defaults to (for detecting changes)
const SLIDER_GROUPS = [
    {
        label: 'Enhancements',
        sliders: [
            { key: 'brightness', label: 'Brightness', displayMin: -100, displayMax: 100, displayDefault: 0, fabricDefault: 0 },
            { key: 'contrast', label: 'Contrast', displayMin: -100, displayMax: 100, displayDefault: 0, fabricDefault: 0 },
            { key: 'exposure', label: 'Exposure', displayMin: -100, displayMax: 100, displayDefault: 0, fabricDefault: 0 },
        ],
    },
    {
        label: 'Color',
        sliders: [
            { key: 'saturation', label: 'Saturation', displayMin: -100, displayMax: 100, displayDefault: 0, fabricDefault: 0 },
            { key: 'vibrance', label: 'Vibrance', displayMin: -100, displayMax: 100, displayDefault: 0, fabricDefault: 0 },

        ],
    },
    {
        label: 'Detail',
        sliders: [
            { key: 'blur', label: 'Blur', displayMin: 0, displayMax: 100, displayDefault: 0, fabricDefault: 0 },
            { key: 'noise', label: 'Noise', displayMin: 0, displayMax: 100, displayDefault: 0, fabricDefault: 0 },
            { key: 'pixelate', label: 'Pixelate', displayMin: 1, displayMax: 20, displayDefault: 1, fabricDefault: 1 },
        ],
    },
    {
        label: 'RGB Channels',
        sliders: [
            { key: 'gammaR', label: 'Red', displayMin: 10, displayMax: 220, displayDefault: 100, fabricDefault: 1, isGamma: true },
            { key: 'gammaG', label: 'Green', displayMin: 10, displayMax: 220, displayDefault: 100, fabricDefault: 1, isGamma: true },
            { key: 'gammaB', label: 'Blue', displayMin: 10, displayMax: 220, displayDefault: 100, fabricDefault: 1, isGamma: true },
        ],
    },
];

// All sliders flattened for easy lookup
const ALL_SLIDERS = SLIDER_GROUPS.flatMap(g => g.sliders);

// Default display values
const DEFAULT_CUSTOM = Object.fromEntries(ALL_SLIDERS.map(s => [s.key, s.displayDefault]));

// Convert display → Fabric native value
const toFabric = (key, display) => {
    switch (key) {
        case 'brightness':
        case 'contrast':
        case 'exposure':
        case 'saturation':
        case 'vibrance': return display / 100;           // –1..1
        case 'hue': return display;                 // degrees (converted to rad in helper)
        case 'blur': return display / 200;           // 0..0.5
        case 'noise': return (display / 100) * 1000; // 0..1000
        case 'pixelate': return display;                 // 1..20
        case 'gammaR':
        case 'gammaG':
        case 'gammaB': return display / 100;           // 0.1..2.2
        default: return display;
    }
};

// Restore display value from stored Fabric value
const fromFabric = (key, stored) => {
    switch (key) {
        case 'brightness':
        case 'contrast':
        case 'exposure':
        case 'saturation':
        case 'vibrance': return Math.round(stored * 100);
        case 'hue': return Math.round(stored);
        case 'blur': return Math.round(stored * 200);
        case 'noise': return Math.round((stored / 1000) * 100);
        case 'pixelate': return Math.round(stored);
        case 'gammaR':
        case 'gammaG':
        case 'gammaB': return Math.round(stored * 100);
        default: return stored;
    }
};

// Gamma channel accent colors
const GAMMA_COLORS = { gammaR: '#e25d5d', gammaG: '#5db87a', gammaB: '#5d8ee2' };

// ─── Main component ───────────────────────────────────────────────────────────
const ImageFilterTool = ({ activeObject }) => {
    const { canvas } = useCanvasContext();
    const [activeFilter, setActiveFilter] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [customVals, setCustomVals] = useState(DEFAULT_CUSTOM);
    const [showCustom, setShowCustom] = useState(false);

    const isImage = activeObject &&
        (activeObject.type === 'image' ||
            activeObject.type === 'FabricImage' ||
            (activeObject.constructor && activeObject.constructor.name === 'FabricImage'));

    // ── Sync state from active object ─────────────────────────────────────────
    useEffect(() => {
        if (!isImage || !activeObject) {
            setImageSrc(null); setActiveFilter(null); setCustomVals(DEFAULT_CUSTOM);
            return;
        }

        setActiveFilter(activeObject.customFilter || null);

        // Restore custom slider display values from stored Fabric values
        if (activeObject.customFilterValues) {
            const stored = activeObject.customFilterValues;
            const display = {};
            ALL_SLIDERS.forEach(s => {
                display[s.key] = stored[s.key] !== undefined
                    ? fromFabric(s.key, stored[s.key])
                    : s.displayDefault;
            });
            setCustomVals(display);
            setShowCustom(true);
        } else {
            setCustomVals(DEFAULT_CUSTOM);
        }

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
    }, [activeObject, isImage]);

    if (!isImage) return null;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSelectPreset = (filterName) => {
        setActiveFilter(filterName === 'None' ? null : filterName);
        setCustomVals(DEFAULT_CUSTOM);
        changeImageFilter(activeObject, filterName, canvas);
    };

    const handleCustomSlider = (key, displayVal) => {
        const next = { ...customVals, [key]: displayVal };
        setCustomVals(next);
        setActiveFilter('Custom');
        // Build Fabric values for all sliders
        const fabricVals = {};
        ALL_SLIDERS.forEach(s => { fabricVals[s.key] = toFabric(s.key, next[s.key]); });
        changeImageCustomFilter(activeObject, fabricVals, canvas);
    };

    const handleResetCustom = () => {
        setCustomVals(DEFAULT_CUSTOM);
        setActiveFilter(null);
        changeImageFilter(activeObject, 'None', canvas);
    };

    const activeFilterLabel = activeFilter || 'None';
    const isCustomActive = activeFilter === 'Custom';
    const hasCustomChanges = ALL_SLIDERS.some(s => customVals[s.key] !== s.displayDefault);

    return (
        <section className="mus-tool-section">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="mus-tool-label">Image Filters</h3>
                {activeFilter && (
                    <span className="mus-tool-badge-accent mus-tool-badge">{activeFilter}</span>
                )}
            </div>

            {/* Preset grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {FILTERS.map((filter) => {
                    const isActive = !isCustomActive && activeFilterLabel === filter.name;
                    return (
                        <button
                            key={filter.name}
                            onClick={() => handleSelectPreset(filter.name)}
                            title={filter.name}
                            style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '0.375rem',
                                padding: '0.375rem', borderRadius: '0.75rem',
                                border: isActive ? '2px solid var(--border-dark)' : '1px solid var(--border-light)',
                                backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-main)',
                                cursor: 'pointer', transition: 'all 0.2s ease',
                                position: 'relative', overflow: 'hidden',
                            }}
                        >
                            {/* Preview thumbnail */}
                            <div style={{
                                width: '100%', aspectRatio: '1 / 1',
                                borderRadius: '0.5rem', overflow: 'hidden',
                                backgroundColor: 'var(--border-light)',
                                flexShrink: 0, position: 'relative',
                            }}>
                                {imageSrc ? (
                                    <img src={imageSrc} alt={filter.name} draggable={false}
                                        style={{
                                            width: '100%', height: '100%', objectFit: 'cover',
                                            filter: filter.css, display: 'block', pointerEvents: 'none',
                                        }}
                                    />
                                ) : (
                                    <FilterPlaceholder filterCss={filter.css} />
                                )}
                                {isActive && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '0.5rem',
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <span style={{
                                fontSize: '0.5625rem', fontWeight: 800,
                                letterSpacing: '0.04em', textTransform: 'uppercase',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                lineHeight: 1, whiteSpace: 'nowrap',
                                overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
                            }}>
                                {filter.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Custom Adjust toggle header */}
            <div className="mus-tool-divider">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowCustom(p => !p)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        }}
                    >
                        <span className="mus-tool-label" style={{
                            color: isCustomActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}>
                            Custom Adjust
                        </span>
                        {isCustomActive && (
                            <span className="mus-tool-badge-accent mus-tool-badge">Active</span>
                        )}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="var(--text-muted)" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round"
                            style={{
                                transform: showCustom ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                            }}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {hasCustomChanges && showCustom && (
                        <button
                            onClick={handleResetCustom}
                            className="mus-tool-btn mus-tool-btn-surface"
                            style={{ fontSize: '0.5625rem', padding: '0.25rem 0.5rem' }}
                        >
                            Reset All
                        </button>
                    )}
                </div>
            </div>

            {/* Custom slider groups */}
            {showCustom && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {SLIDER_GROUPS.map(group => (
                        <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {/* Group label */}
                            <span style={{
                                fontSize: '0.5rem', fontWeight: 900,
                                letterSpacing: '0.12em', textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                borderBottom: '1px solid var(--border-light)',
                                paddingBottom: '0.25rem',
                            }}>
                                {group.label}
                            </span>

                            {group.sliders.map(slider => (
                                <CustomSliderRow
                                    key={slider.key}
                                    slider={slider}
                                    value={customVals[slider.key]}
                                    accentColor={GAMMA_COLORS[slider.key] || null}
                                    onChange={(v) => handleCustomSlider(slider.key, v)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

// ─── Custom slider row ────────────────────────────────────────────────────────
const CustomSliderRow = ({ slider, value, accentColor, onChange }) => {
    const isChanged = value !== slider.displayDefault;
    const accent = accentColor || 'var(--accent)';

    const range = slider.displayMax - slider.displayMin;
    const pct = ((value - slider.displayMin) / range) * 100;
    const track = `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, var(--border-light) ${pct}%, var(--border-light) 100%)`;

    // Format display label: show +/- sign for zero-centered sliders, plain for 1-based
    const formatLabel = (v) => {
        if (slider.displayDefault === 0) return v > 0 ? `+${v}` : `${v}`;
        if (slider.isGamma) return `${(v / 100).toFixed(2)}`;
        return `${v}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div className="flex items-center justify-between">
                <span className="mus-tool-label" style={{
                    color: isChanged ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                    {slider.label}
                </span>
                <div className="mus-tool-badge" style={{
                    minWidth: '2.75rem', textAlign: 'right',
                    backgroundColor: isChanged ? (accentColor ? `${accentColor}22` : 'rgba(232,192,74,0.15)') : 'var(--bg-main)',
                    color: isChanged ? (accentColor || 'var(--text-primary)') : 'var(--text-muted)',
                    fontSize: '0.5625rem', fontWeight: 800,
                }}>
                    {formatLabel(value)}
                </div>
            </div>
            <input
                type="range"
                min={slider.displayMin}
                max={slider.displayMax}
                step={1}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="mus-tool-range w-full"
                style={{ backgroundImage: track }}
            />
        </div>
    );
};

// ─── Placeholder ──────────────────────────────────────────────────────────────
const FilterPlaceholder = ({ filterCss }) => (
    <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #d4cbba 0%, #f2ede4 50%, #e8c04a55 100%)',
        filter: filterCss,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="rgba(26,26,26,0.3)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    </div>
);

export default ImageFilterTool;
