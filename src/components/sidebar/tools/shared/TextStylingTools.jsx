import React, { useEffect, useState, useRef, useCallback } from 'react';
import DelayedInput from './DelayedInput';
import ColorPaletteSelector from './ColorPaletteSelector';
import SmartDropdown from '../../../shared/SmartDropdown';
import CollapsibleToolSection from './CollapsibleToolSection';
import { useCanvasContext } from '../../../../context/CanvasContext';
import {
    changeFontSize,
    changeFontFamily,
    changeFontWeight,
    changeSelectedTextProperty,
    getTextSelection,
    alignLeft, alignCenterH, alignRight
} from '../../../Helper/FabricHelper';
import { FONT_LIST, loadGoogleFont, loadFontPreview } from '../../../../utils/fontList';

/**
 * A single font item that lazy-loads its Google Font preview
 * when it scrolls into view using IntersectionObserver.
 */
const FontItem = ({ font, isActive, onSelect }) => {
    const ref = useRef(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !loaded) {
                    loadFontPreview(font).then(() => setLoaded(true));
                    observer.unobserve(el);
                }
            },
            { rootMargin: '100px' } // Start loading slightly before visible
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [font, loaded]);

    return (
        <button
            ref={ref}
            onClick={() => onSelect(font)}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-center justify-between group ${isActive
                    ? 'bg-[#E8C04A] text-[#1A1A1A] font-bold border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'
                    : 'hover:bg-[#E8C04A]/20 text-[#1A1A1A] border-2 border-transparent'
                }`}
        >
            <div className="flex flex-col gap-0.5">
                <span
                    className="text-xs font-bold"
                    style={{ fontFamily: loaded ? font : 'inherit' }}
                >
                    {font}
                </span>
                <span className="text-[9px] text-[#7A7062] font-black uppercase tracking-tighter">
                    {loaded ? 'Google Fonts' : 'Loading…'}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <span
                    className="text-sm opacity-50 group-hover:opacity-100 transition-opacity font-medium"
                    style={{ fontFamily: loaded ? font : 'inherit' }}
                >
                    Abgl
                </span>
                {isActive && (
                    <div className="w-4 h-4 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                )}
            </div>
        </button>
    );
};

const TextStylingTools = ({ activeObject }) => {
    const { canvas, canvases } = useCanvasContext();

    const selection = activeObject ? getTextSelection(activeObject) : { hasSelection: false };

    const [fontSize, setFontSize] = useState(24);
    const [lineHeight, setLineHeight] = useState(1.16);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontWeight, setFontWeight] = useState('normal');
    const [fontStyle, setFontStyle] = useState('normal');
    const [textAlign, setTextAlign] = useState('left');
    const [fill, setFill] = useState('#000000');
    const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);

    // Normalize fontFamily: extract only the first font from a CSS stack (e.g. "Inter, ui-sans-serif" -> "Inter")
    const normalizeFontFamily = (family) => {
        if (!family) return 'Arial';
        return family.split(',')[0].trim().replace(/['"|]/g, '');
    };

    // Normalize fontWeight: Fabric may return "bold" (=700) or "normal" (=400)
    const normalizeFontWeight = (weight) => {
        if (weight === 'bold') return '700';
        if (weight === 'normal') return '400';
        return String(weight);
    };

    // If text is selected, try to read the style of the first selected char for display
    const getDisplayProp = (prop, fallback) => {
        if (!activeObject) return fallback;
        const selection = getTextSelection(activeObject);
        if (selection.hasSelection) {
            const styles = activeObject.getSelectionStyles(selection.start, selection.start + 1);
            if (styles && styles.length > 0 && styles[0][prop] !== undefined) {
                return styles[0][prop];
            }
        }
        return activeObject[prop] ?? fallback;
    };


    useEffect(() => {
        if (!activeObject || !canvas) return;

        const updateState = () => {
            setFontSize(getDisplayProp('fontSize', 24));
            setLineHeight(getDisplayProp('lineHeight', 1.16));
            setFontFamily(normalizeFontFamily(getDisplayProp('fontFamily', 'Arial')));
            setFontWeight(normalizeFontWeight(getDisplayProp('fontWeight', '400')));
            setFontStyle(getDisplayProp('fontStyle', 'normal'));
            setTextAlign(getDisplayProp('textAlign', 'left'));
            setFill(getDisplayProp('fill', '#000000'));
        };

        updateState();

        const handleModified = (e) => {
            if (e.target === activeObject) updateState();
        };

        canvas.on('object:modified', handleModified);
        canvas.on('selection:updated', updateState);
        canvas.on('selection:created', updateState);

        return () => {
            canvas.off('object:modified', handleModified);
            canvas.off('selection:updated', updateState);
            canvas.off('selection:created', updateState);
        };
    }, [canvas, activeObject]);


    const fonts = FONT_LIST;

    const weights = [
        { label: 'Thin', value: '100' },
        { label: 'Extra Light', value: '200' },
        { label: 'Light', value: '300' },
        { label: 'Regular', value: '400' },
        { label: 'Medium', value: '500' },
        { label: 'Semi Bold', value: '600' },
        { label: 'Bold', value: '700' },
        { label: 'Extra Bold', value: '800' },
        { label: 'Black', value: '900' },
    ];

    const selectClass = "mus-tool-select";

    const applyFontFamily = async (family) => {
        if (!activeObject) return;

        // Close the font picker
        setIsFontPickerOpen(false);

        // Wait for the font to load via the CSS Font Loading API
        await loadGoogleFont(family);

        // Optimistically update the UI dropdown
        setFontFamily(family);

        // Ensure canvas and activeObject are still valid after the async delay
        if (!canvas || !canvas.getObjects().includes(activeObject)) return;

        const selection = getTextSelection(activeObject);
        if (selection.hasSelection) {
            changeSelectedTextProperty(activeObject, 'fontFamily', family, canvas);
        } else {
            changeFontFamily(activeObject, family, canvas);
        }
    };

    const applyFontWeight = (weight) => {
        if (!activeObject) return;
        const selection = getTextSelection(activeObject);
        if (selection.hasSelection) {
            changeSelectedTextProperty(activeObject, 'fontWeight', weight, canvas);
            const newFontWeight = getDisplayProp('fontWeight', '400');
            setFontWeight(normalizeFontWeight(newFontWeight));
        } else {
            changeFontWeight(activeObject, weight, canvas);
            const newFontWeight = getDisplayProp('fontWeight', '400');
            setFontWeight(normalizeFontWeight(newFontWeight));
        }
    };

    const applyFontSize = (size) => {
        if (!activeObject) return;
        const selection = getTextSelection(activeObject);
        if (selection.hasSelection) {
            changeSelectedTextProperty(activeObject, 'fontSize', size, canvas);
            const newFontSize = getDisplayProp('fontSize', 24);
            setFontSize(newFontSize);
        } else {
            changeFontSize(activeObject, size, canvas);
            const newFontSize = getDisplayProp('fontSize', 24);
            setFontSize(newFontSize);
        }
    };

    const applyLineHeight = (val) => {
        if (!activeObject) return;
        const selection = getTextSelection(activeObject);
        // Line height is typically an object-level property in Fabric, 
        // but changeSelectedTextProperty fallback will handle it.
        changeSelectedTextProperty(activeObject, 'lineHeight', val, canvas);
        setLineHeight(getDisplayProp('lineHeight', 1.16));
    };

    const applyFontStyle = (style) => {
        if (!activeObject) return;
        changeSelectedTextProperty(activeObject, 'fontStyle', style, canvas);
        setFontStyle(getDisplayProp('fontStyle', 'normal'));
    };

    const applyTextAlign = (align) => {
        if (!activeObject) return;
        changeSelectedTextProperty(activeObject, 'textAlign', align, canvas);
        setTextAlign(getDisplayProp('textAlign', 'left'));
    };

    const applyFill = (color) => {
        if (!activeObject) return;

        changeSelectedTextProperty(activeObject, 'fill', color, canvas);
    };

    if (!activeObject) return null;

    const selectionBadge = selection.hasSelection ? (
        <span className="mus-tool-badge-accent mus-tool-badge">
            Selection Only
        </span>
    ) : null;

    return (
        <CollapsibleToolSection title="Text" actionButton={selectionBadge}>

            {/* ── FONT FAMILY ────────────────────────────────────────── */}
            <div className="space-y-2 relative">
                <SmartDropdown
                    isOpen={isFontPickerOpen}
                    onClose={() => setIsFontPickerOpen(false)}
                    triggerClassName="w-full"
                    trigger={
                        <button
                            onClick={() => setIsFontPickerOpen(!isFontPickerOpen)}
                            className={`${selectClass} w-full text-left flex items-center gap-3 px-3 h-11 bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all duration-200`}
                        >
                            <div className="w-6 h-6 rounded-md bg-[#F2EDE4] border border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] shrink-0">
                                <span className="text-[10px] font-black uppercase">Ag</span>
                            </div>
                            <span className="truncate flex-1 text-xs font-bold uppercase tracking-tight" style={{ fontFamily }}>
                                {fontFamily}
                            </span>
                            <div className="text-[#1A1A1A]">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </button>
                    }
                >
                    <div className="max-h-80 overflow-y-auto custom-scrollbar p-1 space-y-1">
                        {fonts.map(font => (
                            <FontItem
                                key={font}
                                font={font}
                                isActive={fontFamily === font}
                                onSelect={applyFontFamily}
                            />
                        ))}
                    </div>
                </SmartDropdown>
            </div>

            {/* ── WEIGHT & SIZE ──────────────────────────────────────── */}
            <div className="grid grid-cols-[1.2fr_1fr] gap-3">
                <div className="mus-tool-select-wrapper">
                    <select
                        value={fontWeight.toString()}
                        onChange={(e) => applyFontWeight(e.target.value)}
                        className={selectClass}
                    >
                        {weights.map(w => (
                            <option key={w.value} value={w.value}>{w.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>
                </div>

                <div className="mus-tool-input-group">
                    <button
                        onClick={() => applyFontSize(Math.max(1, fontSize - 1))}
                        className="mus-tool-input-btn"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <DelayedInput
                        value={fontSize}
                        isNumeric={true}
                        onChange={(val) => applyFontSize(parseInt(val) || 12)}
                        className="mus-tool-input-pure"
                    />
                    <button
                        onClick={() => applyFontSize(fontSize + 1)}
                        className="mus-tool-input-btn"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── LINE HEIGHT ────────────────────────────────────────── */}
            <div className="space-y-2">
                <label className="mus-tool-label">Line Height</label>
                <div className="flex items-center gap-3">
                    <div className="mus-tool-badge w-12 h-7 flex items-center justify-center gap-0.5 flex-shrink-0">
                        <DelayedInput
                            value={lineHeight}
                            isNumeric={true}
                            onChange={(val) => applyLineHeight(parseFloat(val) || 1.16)}
                            className="mus-tool-input-pure !text-[10px] !text-center w-full"
                        />
                    </div>
                    <div className="flex-1 flex items-center">
                        <input
                            type="range"
                            min="0.1"
                            max="5.0"
                            step="0.1"
                            value={lineHeight}
                            onChange={(e) => applyLineHeight(parseFloat(e.target.value))}
                            className="mus-tool-range w-full"
                        />
                    </div>
                </div>
            </div>

            {/* ── STYLE & ALIGNMENT ───────────────────────────────────── */}
            <div className="space-y-2">
                <label className="mus-tool-label">Style & Align</label>
                <div className="mus-tool-input-group">
                    {/* Italic Toggle */}
                    <button
                        onClick={() => applyFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
                        className={`mus-tool-input-btn flex-1 h-9 ${fontStyle === 'italic' ? 'mus-button-ghost-active' : ''}`}
                        title="Italic"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
                        </svg>
                    </button>

                    <div className="w-[1px] h-6 bg-zinc-200/50 self-center" />

                    {/* Horizontal Alignment */}
                    <button
                        onClick={() => applyTextAlign('left')}
                        className={`mus-tool-input-btn flex-1 h-9 ${textAlign === 'left' ? 'mus-button-ghost-active' : ''}`}
                        title="Align Left"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
                        </svg>
                    </button>
                    <button
                        onClick={() => applyTextAlign('center')}
                        className={`mus-tool-input-btn flex-1 h-9 ${textAlign === 'center' ? 'mus-button-ghost-active' : ''}`}
                        title="Align Center"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" />
                        </svg>
                    </button>
                    <button
                        onClick={() => applyTextAlign('right')}
                        className={`mus-tool-input-btn flex-1 h-9 ${textAlign === 'right' ? 'mus-button-ghost-active' : ''}`}
                        title="Align Right"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── COLOR ─────────────────────────────────────────────── */}
            {/* <div className="mus-tool-divider space-y-4">
                <div className="flex items-center justify-between">
                    <span className="mus-tool-label">Solid Fill</span>
                    <div
                        className="w-5 h-5 rounded-full border border-zinc-200 shadow-sm"
                        style={{ backgroundColor: fill }}
                    />
                </div>
                <ColorPaletteSelector
                    color={fill}
                    onChange={applyFill}
                />
            </div> */}
        </CollapsibleToolSection>
    );
};

export default TextStylingTools;
