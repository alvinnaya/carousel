import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { parseColor, hexToRgb, rgbToHex, rgbToHsv, hsvToRgb, rgbToHsl, hslToRgb, clamp, formatColor } from '../../../Helper/ColorHelper';
import DelayedInput from './DelayedInput';

const PremiumColorPicker = ({ color = "#1DFF2D", onChange, onClose }) => {
    const initialColor = useMemo(() => parseColor(color), [color]);
    
    const [hsv, setHsv] = useState({ h: initialColor.h, s: initialColor.s, v: initialColor.v, a: initialColor.a });
    const [rgb, setRgb] = useState({ r: initialColor.r, g: initialColor.g, b: initialColor.b });
    const [hsl, setHsl] = useState({ h: initialColor.h, s: initialColor.s_hsl, l: initialColor.l });
    const [hex, setHex] = useState(initialColor.hex);
    const [mode, setMode] = useState('HEX'); // 'HEX', 'RGB', 'HSL'

    const svRef = useRef(null);
    const hueRef = useRef(null);
    const alphaRef = useRef(null);

    // Sync external color prop to internal state
    useEffect(() => {
        const parsed = parseColor(color);
        // Only update if the color is actually different to avoid cycles
        if (parsed.hex !== hex || Math.abs(parsed.a - hsv.a) > 0.01) {
            setHsv({ h: parsed.h, s: parsed.s, v: parsed.v, a: parsed.a });
            setRgb({ r: parsed.r, g: parsed.g, b: parsed.b });
            setHsl({ h: parsed.h, s: parsed.s_hsl, l: parsed.l });
            setHex(parsed.hex);
        }
    }, [color]);

    const updateAll = useCallback((newHsv) => {
        const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
        const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        
        setHsv(newHsv);
        setRgb(newRgb);
        setHsl(newHsl);
        setHex(newHex);

        if (onChange) {
            const colorObj = { ...newRgb, ...newHsl, s_hsl: newHsl.s, ...newHsv, hex: newHex };
            let format = mode.toLowerCase();
            if (newHsv.a < 1) {
                format = mode === 'HSL' ? 'hsla' : 'rgba';
            } else if (mode === 'HEX') {
                format = 'hex';
            }
            onChange(formatColor(colorObj, format));
        }
    }, [onChange, mode]);

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
            const newHsv = { ...hsv, a };
            setHsv(newHsv);
            
            if (onChange) {
                const colorObj = { ...rgb, ...hsl, s_hsl: hsl.s, ...hsv, hex, a };
                let format = mode.toLowerCase();
                if (a < 1) {
                    format = mode === 'HSL' ? 'hsla' : 'rgba';
                }
                onChange(formatColor(colorObj, format));
            }
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
            const parsed = parseColor(val);
            setRgb({ r: parsed.r, g: parsed.g, b: parsed.b });
            setHsl({ h: parsed.h, s: parsed.s, l: parsed.l });
            setHsv({ h: parsed.h, s: parsed.s, v: parsed.v, a: hsv.a });
            if (onChange) onChange(val);
        }
    };

    const handleRGBInputChange = (key, val) => {
        let num = parseFloat(val);
        if (isNaN(num)) return;
        
        if (key === 'a') num = clamp(num, 0, 1);
        else num = clamp(Math.round(num), 0, 255);

        const newRgb = { ...rgb, [key]: num };
        if (key === 'a') {
            setHsv(prev => ({ ...prev, a: num }));
            if (onChange) {
                const colorObj = { ...hsl, s_hsl: hsl.s, ...hsv, ...rgb, a: num };
                onChange(formatColor(colorObj, num < 1 ? (mode === 'HSL' ? 'hsla' : 'rgba') : mode.toLowerCase()));
            }
        } else {
            const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
            const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
            const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
            const resHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
            
            setRgb(newRgb);
            setHex(newHex);
            setHsl(newHsl);
            // Only update HSV hue if the color isn't gray, otherwise keep the old one
            const finalHsv = {
                h: newRgb.r === newRgb.g && newRgb.g === newRgb.b ? prev.h : resHsv.h,
                s: resHsv.s,
                v: resHsv.v,
                a: prev.a
            };
            setHsv(finalHsv);

            if (onChange) {
                const colorObj = { ...finalHsv, ...newHsl, s_hsl: newHsl.s, ...newRgb, hex: newHex };
                onChange(formatColor(colorObj, hsv.a < 1 ? 'rgba' : mode.toLowerCase()));
            }
        }
    };

    const handleHSLInputChange = (key, val) => {
        let num = parseFloat(val);
        if (isNaN(num)) return;

        if (key === 'a') num = clamp(num, 0, 1);
        else if (key === 'h') num = clamp(num, 0, 360);
        else num = clamp(num, 0, 100);

        const newHsl = { ...hsl, [key]: num };
        
        if (key === 'a') {
            setHsv(prev => ({ ...prev, a: num }));
            if (onChange) {
                const colorObj = { ...rgb, ...hsv, ...hsl, s_hsl: hsl.s, a: num };
                onChange(formatColor(colorObj, num < 1 ? 'hsla' : mode.toLowerCase()));
            }
        } else {
            const rgbRes = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
            const resHex = rgbToHex(rgbRes.r, rgbRes.g, rgbRes.b);
            const resHsv = rgbToHsv(rgbRes.r, rgbRes.g, rgbRes.b);
            
            setHsl(newHsl);
            setRgb(rgbRes);
            setHex(resHex);
            const finalHsv = { h: newHsl.h, s: resHsv.s, v: resHsv.v, a: hsv.a };
            setHsv(finalHsv);

            if (onChange) {
                const colorObj = { ...rgbRes, ...finalHsv, ...newHsl, s_hsl: newHsl.s, hex: resHex };
                onChange(formatColor(colorObj, hsv.a < 1 ? 'hsla' : mode.toLowerCase()));
            }
        }
    };

    const handleEyedropper = async () => {
        if (!window.EyeDropper) return;
        const dropper = new window.EyeDropper();
        try {
            const result = await dropper.open();
            const newHex = result.sRGBHex.toUpperCase();
            const parsed = parseColor(newHex);
            setHex(newHex);
            setRgb({ r: parsed.r, g: parsed.g, b: parsed.b });
            setHsl({ h: parsed.h, s: parsed.s_hsl, l: parsed.l });
            setHsv({ h: parsed.h, s: parsed.s, v: parsed.v, a: hsv.a });
            if (onChange) onChange(newHex);
        } catch (e) {
            console.warn('Eyedropper failed or cancelled');
        }
    };

    const handleHSVInputChange = (key, val) => {
        let num = parseFloat(val);
        if (isNaN(num)) return;

        if (key === 'a') num = clamp(num, 0, 1);
        else if (key === 'h') num = clamp(num, 0, 360);
        else num = clamp(num, 0, 100);

        const newHsv = { ...hsv, [key]: num };
        
        if (key === 'a') {
            setHsv(newHsv);
            if (onChange) {
                const colorObj = { ...hsl, s_hsl: hsl.s, ...hsv, ...rgb, a: num };
                onChange(formatColor(colorObj, num < 1 ? 'rgba' : mode.toLowerCase()));
            }
        } else {
            const rgbRes = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
            const resHex = rgbToHex(rgbRes.r, rgbRes.g, rgbRes.b);
            const resHsl = rgbToHsl(rgbRes.r, rgbRes.g, rgbRes.b);
            
            setHsv(newHsv);
            setRgb(rgbRes);
            setHex(resHex);
            setHsl(resHsl);

            if (onChange) {
                // Ensure all color models are present for formatColor
                const colorObj = { ...rgbRes, ...resHsl, s_hsl: resHsl.s, ...newHsv, hex: resHex };
                onChange(formatColor(colorObj, hsv.a < 1 ? 'hsva' : mode.toLowerCase()));
            }
        }
    };

    return (
        <div className="w-full space-y-4 select-none">
            {/* ── Saturation/Value Box ──────────────────────────────── */}
            <div
                ref={svRef}
                onMouseDown={handleSVMouseDown}
                className="relative w-full h-32 cursor-crosshair overflow-hidden mus-color-box rounded-lg"
                style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div
                    className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 transition-[top,left] duration-75 pointer-events-none mus-color-handle border-2 border-white shadow-sm"
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
                    title="Eyedropper"
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
                        className="relative h-2.5 cursor-pointer mus-color-slider-track rounded-full"
                        style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
                    >
                        <div
                            className="absolute top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none mus-color-handle border-2 border-white shadow-sm"
                            style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
                        />
                    </div>

                    {/* Alpha Slider */}
                    <div
                        ref={alphaRef}
                        onMouseDown={handleAlphaMouseDown}
                        className="relative h-2.5 rounded-full cursor-pointer shadow-inner overflow-hidden"
                        style={{ background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAACVJREFUGF5jYGBgYGBgYGBgYGBgYGBgYGBgYGBgYICAFAA9AAEAnfB4AAAAAElFTkSuQmCC")' }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{ background: `linear-gradient(to right, transparent, ${hex})` }}
                        />
                        <div
                            className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: `${hsv.a * 100}%`, backgroundColor: hex }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Mode Selector ─────────────────────────────────────── */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                {['HEX', 'RGB', 'HSL', 'HSV'].map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${
                            mode === m 
                            ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' 
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* ── Inputs ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-2">
                {mode === 'HEX' && (
                    <>
                        <div className="col-span-3 space-y-1">
                            <label className="mus-color-label block text-center uppercase">Hex</label>
                            <input
                                type="text"
                                value={hex}
                                onChange={handleHexChange}
                                className="w-full px-2 py-1.5 mus-color-input uppercase font-mono text-center text-xs"
                            />
                        </div>
                        <div className="space-y-1 col-span-1">
                            <label className="mus-color-label block text-center uppercase">A</label>
                            <DelayedInput
                                value={hsv.a}
                                isNumeric={true}
                                min="0"
                                max="1"
                                onChange={(val) => handleRGBInputChange('a', val)}
                                className="w-full text-center py-1.5 mus-color-input text-xs"
                            />
                        </div>
                    </>
                )}

                {mode === 'RGB' && (
                    <>
                        {['r', 'g', 'b', 'a'].map(k => (
                            <div key={k} className="space-y-1">
                                <label className="mus-color-label block text-center uppercase">{k}</label>
                                <DelayedInput
                                    value={k === 'a' ? hsv.a : rgb[k]}
                                    isNumeric={true}
                                    min={k === 'a' ? "0" : "0"}
                                    max={k === 'a' ? "1" : "255"}
                                    onChange={(val) => handleRGBInputChange(k, val)}
                                    className="w-full text-center py-1.5 mus-color-input text-xs"
                                />
                            </div>
                        ))}
                    </>
                )}

                {mode === 'HSL' && (
                    <>
                        {['h', 's', 'l', 'a'].map(k => (
                            <div key={k} className="space-y-1">
                                <label className="mus-color-label block text-center uppercase">{k}</label>
                                <DelayedInput
                                    value={k === 'a' ? hsv.a : hsl[k]}
                                    isNumeric={true}
                                    min="0"
                                    max={k === 'h' ? "360" : (k === 'a' ? "1" : "100")}
                                    onChange={(val) => handleHSLInputChange(k, val)}
                                    className="w-full text-center py-1.5 mus-color-input text-xs"
                                />
                            </div>
                        ))}
                    </>
                )}

                {mode === 'HSV' && (
                    <>
                        {['H', 'S', 'V', 'A'].map(label => {
                            const k = label.toLowerCase();
                            return (
                                <div key={label} className="space-y-1">
                                    <label className="mus-color-label block text-center uppercase">{label}</label>
                                    <DelayedInput
                                        value={hsv[k]}
                                        isNumeric={true}
                                        min="0"
                                        max={k === 'h' ? "360" : (k === 'a' ? "1" : "100")}
                                        onChange={(val) => handleHSVInputChange(k, val)}
                                        className="w-full text-center py-1.5 mus-color-input text-xs"
                                    />
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
};

export default PremiumColorPicker;
