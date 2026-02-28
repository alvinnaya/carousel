import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parseColor, hexToRgb, rgbToHex, rgbToHsv, hsvToRgb, clamp } from '../../../Helper/ColorHelper';

const PremiumColorPicker = ({ color = "#1DFF2D", onChange, onClose }) => {
    const initialColor = parseColor(color);
    const initialHsv = rgbToHsv(initialColor.r, initialColor.g, initialColor.b);

    const [hsv, setHsv] = useState({ ...initialHsv, a: initialColor.a });
    const [hex, setHex] = useState(initialColor.hex);
    const [rgb, setRgb] = useState({ r: initialColor.r, g: initialColor.g, b: initialColor.b });

    const svRef = useRef(null);
    const hueRef = useRef(null);
    const alphaRef = useRef(null);

    // Sync external color prop to internal state
    useEffect(() => {
        const parsed = parseColor(color);
        if (parsed.hex !== hex || parsed.a !== hsv.a) {
            const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
            setHex(parsed.hex);
            setRgb({ r: parsed.r, g: parsed.g, b: parsed.b });
            setHsv({ ...newHsv, a: parsed.a });
        }
    }, [color]);

    const updateAll = useCallback((newHsv) => {
        const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        setHsv(newHsv);
        setRgb({ r: newRgb.r, g: newRgb.g, b: newRgb.b });
        setHex(newHex);
        if (onChange) onChange(newHex);
    }, [onChange]);

    // ─── Drag Logic ─────────────────────────────────────────────────────────
    const handleSVMouseDown = (e) => {
        const handleMove = (e) => {
            if (!svRef.current) return;
            const rect = svRef.current.getBoundingClientRect();
            const s = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
            const v = clamp(100 - ((e.clientY - rect.top) / rect.height) * 100, 0, 100);
            updateAll({ ...hsv, s, v });
        };
        const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        handleMove(e);
    };

    const handleHueMouseDown = (e) => {
        const handleMove = (e) => {
            if (!hueRef.current) return;
            const rect = hueRef.current.getBoundingClientRect();
            const h = clamp(((e.clientX - rect.left) / rect.width) * 360, 0, 360);
            updateAll({ ...hsv, h });
        };
        const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        handleMove(e);
    };

    const handleAlphaMouseDown = (e) => {
        const handleMove = (e) => {
            if (!alphaRef.current) return;
            const rect = alphaRef.current.getBoundingClientRect();
            const a = clamp((e.clientX - rect.left) / rect.width, 0, 1);
            setHsv(prev => ({ ...prev, a }));
        };
        const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        handleMove(e);
    };

    // ─── Input Logic ────────────────────────────────────────────────────────
    const handleHexChange = (e) => {
        const val = e.target.value.toUpperCase();
        setHex(val);
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            const parsed = hexToRgb(val);
            const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
            setRgb({ r: parsed.r, g: parsed.g, b: parsed.b });
            setHsv({ ...newHsv, a: hsv.a });
            if (onChange) onChange(val);
        }
    };

    const handleRGBInputChange = (key, val) => {
        const num = clamp(parseInt(val) || 0, 0, 255);
        const newRgb = { ...rgb, [key]: num };
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
        setRgb(newRgb);
        setHex(newHex);
        setHsv({ ...newHsv, a: hsv.a });
        if (onChange) onChange(newHex);
    };

    const handleEyedropper = async () => {
        if (!window.EyeDropper) return;
        const dropper = new window.EyeDropper();
        try {
            const result = await dropper.open();
            const newHex = result.sRGBHex.toUpperCase();
            const parsed = hexToRgb(newHex);
            const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
            setHex(newHex);
            setRgb({ r: parsed.r, g: parsed.g, b: parsed.b });
            setHsv({ ...newHsv, a: hsv.a });
            if (onChange) onChange(newHex);
        } catch (e) {
            console.warn('Eyedropper failed or cancelled');
        }
    };

    return (
        <div className="w-full space-y-4 select-none">
            {/* ── Saturation/Value Box ──────────────────────────────── */}
            <div
                ref={svRef}
                onMouseDown={handleSVMouseDown}
                className="relative w-full h-32 cursor-crosshair overflow-hidden mus-color-box"
                style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div
                    className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 transition-[top,left] duration-75 pointer-events-none mus-color-handle"
                    style={{
                        left: `${hsv.s}%`,
                        top: `${100 - hsv.v}%`,
                        backgroundColor: hex
                    }}
                />
            </div>

            {/* ── Sliders ────────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleEyedropper}
                    className="p-2 mus-button-ghost !rounded-lg"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 22l5-5" /><path d="M9.5 14.5L16 8l4.5 4.5L14 19l-4.5-4.5z" /><path d="M15 2l5 5" />
                    </svg>
                </button>

                <div className="flex-1 space-y-3">
                    {/* Hue Slider */}
                    <div
                        ref={hueRef}
                        onMouseDown={handleHueMouseDown}
                        className="relative h-2 cursor-pointer mus-color-slider-track"
                        style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
                    >
                        <div
                            className="absolute top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none mus-color-handle"
                            style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
                        />
                    </div>

                    {/* Alpha Slider */}
                    {/* <div
                        ref={alphaRef}
                        onMouseDown={handleAlphaMouseDown}
                        className="relative h-2 rounded-full cursor-pointer shadow-inner overflow-hidden"
                        style={{ background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAACVJREFUGF5jYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYICAFAA9AAEAnfB4AAAAAElFTkSuQmCC")' }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{ background: `linear-gradient(to right, transparent, ${hex})` }}
                        />
                        <div
                            className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: `${hsv.a * 100}%`, backgroundColor: hex }}
                        />
                    </div> */}
                </div>
            </div>

            {/* ── Inputs ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1.5 space-y-1">
                    <label className="mus-color-label">Hex</label>
                    <input
                        type="text"
                        value={hex}
                        onChange={handleHexChange}
                        className="w-full px-2 py-1.5 mus-color-input"
                    />
                </div>
                <div className="space-y-1">
                    <label className="mus-color-label block text-center">R</label>
                    <input
                        type="text"
                        value={rgb.r}
                        onChange={(e) => handleRGBInputChange('r', e.target.value)}
                        className="w-full text-center py-1.5 mus-color-input"
                    />
                </div>
                <div className="space-y-1">
                    <label className="mus-color-label block text-center">G</label>
                    <input
                        type="text"
                        value={rgb.g}
                        onChange={(e) => handleRGBInputChange('g', e.target.value)}
                        className="w-full text-center py-1.5 mus-color-input"
                    />
                </div>
                <div className="space-y-1">
                    <label className="mus-color-label block text-center">B</label>
                    <input
                        type="text"
                        value={rgb.b}
                        onChange={(e) => handleRGBInputChange('b', e.target.value)}
                        className="w-full text-center py-1.5 mus-color-input"
                    />
                </div>
            </div>
        </div>
    );
};

export default PremiumColorPicker;
