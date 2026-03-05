import React, { useEffect, useState } from 'react';
import DelayedInput from './DelayedInput';
import ColorPaletteSelector from './ColorPaletteSelector';
import { useCanvasContext } from '../../../../context/CanvasContext';
import {
    changeFontSize,
    changeFontFamily,
    changeFontWeight,
    changeSelectedTextProperty,
    getTextSelection,
    alignLeft, alignCenterH, alignRight
} from '../../../Helper/FabricHelper';
import { FONT_LIST, loadGoogleFont } from '../../../../utils/fontList';

const TextStylingTools = ({ activeObject }) => {
    const { canvas, canvases } = useCanvasContext();

    const selection = activeObject ? getTextSelection(activeObject) : { hasSelection: false };

    const [fontSize, setFontSize] = useState(24);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontWeight, setFontWeight] = useState('normal');
    const [fontStyle, setFontStyle] = useState('normal');
    const [textAlign, setTextAlign] = useState('left');
    const [fill, setFill] = useState('#000000');

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



        // Wait for the font to load via the CSS Font Loading API
        await loadGoogleFont(family);

        // Optimistically update the UI dropdown
        await setFontFamily(family);
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
            const newFontWeight = getDisplayProp('fontWeight', 'normal');
            setFontWeight(newFontWeight);
        } else {
            changeFontWeight(activeObject, weight, canvas);
            const newFontWeight = getDisplayProp('fontWeight', 'normal');
            setFontWeight(newFontWeight);
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

    return (
        <section className="mus-tool-section">
            <div className="flex items-center justify-between">
                <h3 className="mus-tool-label">Text</h3>
                {selection.hasSelection && (
                    <span className="mus-tool-badge-accent mus-tool-badge">
                        Selection Only
                    </span>
                )}
            </div>

            {/* ── FONT FAMILY ────────────────────────────────────────── */}
            <div className="space-y-2 relative">
                <div className="mus-tool-select-wrapper">
                    {/* <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div> */}
                    <select
                        value={fontFamily}
                        onChange={(e) => applyFontFamily(e.target.value)}
                        className={`${selectClass} pl-9`}
                    >
                        {!fonts.includes(fontFamily) && (
                            <option value={fontFamily}>{fontFamily}</option>
                        )}
                        {fonts.map(font => (
                            <option key={font} value={font}>{font}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>
                </div>
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
        </section>
    );
};

export default TextStylingTools;
