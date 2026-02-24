import React, { useEffect, useState } from 'react';
import DelayedInput from './DelayedInput';
import ColorPaletteSelector from './ColorPaletteSelector';
import { useCanvasContext } from '../../../../context/CanvasContext';
import {
    changeFontSize,
    changeFontFamily,
    changeFontWeight,
    changeSelectedTextProperty,
    getTextSelection
} from '../../../Helper/FabricHelper';

const TextStylingTools = ({ activeObject }) => {
    const { canvas, canvases } = useCanvasContext();

    const selection = activeObject ? getTextSelection(activeObject) : { hasSelection: false };

    const [fontSize, setFontSize] = useState(24);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontWeight, setFontWeight] = useState('normal');
    const [fill, setFill] = useState('#000000');

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
        if (!activeObject) return;
        console.log("changing")
        const fontSize = getDisplayProp('fontSize', 24);
        const fontFamily = getDisplayProp('fontFamily', 'Arial');
        const fontWeight = getDisplayProp('fontWeight', 'normal');
        const fill = getDisplayProp('fill', '#000000');
        setFontSize(fontSize);
        setFontFamily(fontFamily);
        setFontWeight(fontWeight);
        setFill(fill);
    }, [canvas, activeObject, canvases])



    const fonts = [
        'Montserrat', 'Inter', 'Roboto', 'Open Sans', 'Playfair Display', 'Lora', 'Arial', 'Times New Roman'
    ];

    const weights = [
        { label: 'Regular', value: '300' },
        { label: 'Medium', value: '500' },
        { label: 'SemiBold', value: '600' },
        { label: 'Bold', value: '800' }
    ];

    const selectClass = "w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all appearance-none cursor-pointer shadow-sm";

    const applyFontFamily = (family) => {
        if (!activeObject) return;
        const selection = getTextSelection(activeObject);
        if (selection.hasSelection) {
            changeSelectedTextProperty(activeObject, 'fontFamily', family, canvas);
            const newFontFamily = getDisplayProp('fontFamily', 'Arial');
            setFontFamily(newFontFamily);
        } else {
            changeFontFamily(activeObject, family, canvas);
            const newFontFamily = getDisplayProp('fontFamily', 'Arial');
            setFontFamily(newFontFamily);
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

    const applyFill = (color) => {
        if (!activeObject) return;

        changeSelectedTextProperty(activeObject, 'fill', color, canvas);
    };

    if (!activeObject) return null;

    return (
        <section className="bg-white p-5 rounded-xl border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-800">Text</h3>
                {selection.hasSelection && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Selection Only
                    </span>
                )}
            </div>

            {/* ── FONT FAMILY ────────────────────────────────────────── */}
            <div className="space-y-2 relative">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <select
                        value={fontFamily}
                        onChange={(e) => applyFontFamily(e.target.value)}
                        className={`${selectClass} pl-9`}
                    >
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
                <div className="relative">
                    <select
                        value={fontWeight === 'bold' ? 'bold' : (fontWeight === 'normal' ? 'normal' : fontWeight)}
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

                <div className="flex items-center gap-0.5 bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
                    <button
                        onClick={() => applyFontSize(Math.max(1, fontSize - 1))}
                        className="px-2 py-2 hover:bg-zinc-50 text-zinc-500 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <DelayedInput
                        value={fontSize}
                        onChange={(val) => applyFontSize(parseInt(val) || 12)}
                        className="w-full text-center text-xs font-bold text-zinc-800 bg-transparent border-none focus:ring-0 p-0"
                    />
                    <button
                        onClick={() => applyFontSize(fontSize + 1)}
                        className="px-2 py-2 hover:bg-zinc-50 text-zinc-500 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── COLOR ─────────────────────────────────────────────── */}
            <div className="space-y-4 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Solid Fill</span>
                    <div
                        className="w-5 h-5 rounded-full border border-zinc-200 shadow-sm"
                        style={{ backgroundColor: fill }}
                    />
                </div>
                <ColorPaletteSelector
                    color={fill}
                    onChange={applyFill}
                />
            </div>
        </section>
    );
};

export default TextStylingTools;
