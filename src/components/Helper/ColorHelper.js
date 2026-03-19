export const parseColor = (color) => {
    if (!color) return { r: 0, g: 0, b: 0, a: 1, hex: '#000000', h: 0, s: 0, l: 0, v: 0 };

    let r = 0, g = 0, b = 0, a = 1;

    // Hex
    if (color.startsWith('#')) {
        const hex = color.length === 4 ?
            '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] :
            color;
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
        const hsv = rgbToHsv(r, g, b);
        const hsl = rgbToHsl(r, g, b);
        return { 
            r, g, b, a, 
            hex: hex.toUpperCase(), 
            h: hsv.h, s: hsv.s, v: hsv.v, 
            s_hsl: hsl.s, l: hsl.l 
        };
    }

    // RGB / RGBA
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
    if (rgbMatch) {
        r = parseInt(rgbMatch[1]);
        g = parseInt(rgbMatch[2]);
        b = parseInt(rgbMatch[3]);
        a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
        const hex = rgbToHex(r, g, b);
        const hsv = rgbToHsv(r, g, b);
        const hsl = rgbToHsl(r, g, b);
        return { 
            r, g, b, a, 
            hex, 
            h: hsv.h, s: hsv.s, v: hsv.v, 
            s_hsl: hsl.s, l: hsl.l 
        };
    }

    // HSL / HSLA
    const hslMatch = color.match(/hsla?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%(?:,\s*(\d+(?:\.\d+)?))?\)/);
    if (hslMatch) {
        const h = parseFloat(hslMatch[1]);
        const s = parseFloat(hslMatch[2]);
        const l = parseFloat(hslMatch[3]);
        a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;
        const rgb = hslToRgb(h, s, l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        return { 
            ...rgb, a, hex, 
            h, s: hsv.s, v: hsv.v, 
            s_hsl: s, l 
        };
    }

    // HSV / HSVA
    const hsvMatch = color.match(/hsva?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%(?:,\s*(\d+(?:\.\d+)?))?\)/);
    if (hsvMatch) {
        const h = parseFloat(hsvMatch[1]);
        const s = parseFloat(hsvMatch[2]);
        const v = parseFloat(hsvMatch[3]);
        a = hsvMatch[4] ? parseFloat(hsvMatch[4]) : 1;
        const rgb = hsvToRgb(h, s, v);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return { 
            ...rgb, a, hex, 
            h, s, v, 
            s_hsl: hsl.s, l: hsl.l 
        };
    }

    // Default or named colors (very basic)
    if (color === 'transparent') return { r: 0, g: 0, b: 0, a: 0, hex: '#000000', h: 0, s: 0, l: 0, v: 0 };

    return { r: 0, g: 0, b: 0, a: 1, hex: '#000000', h: 0, s: 0, l: 0, v: 0 };
};

export const hexToRgb = (hex) => {
    return parseColor(hex);
};

export const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
};

export const hsvToRgb = (h, s, v) => {
    h /= 360; s /= 100; v /= 100;
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

export const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
};

export const hslToRgb = (h, s, l) => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

export const formatColor = (colorObj, format = 'hex') => {
    const { r, g, b, a, h, s, l, v, hex, s_hsl } = colorObj;
    const finalA = a !== undefined ? a : 1;
    switch (format) {
        case 'rgba':
            return `rgba(${r}, ${g}, ${b}, ${finalA.toFixed(2)})`;
        case 'hsla':
            const sl = s_hsl !== undefined ? s_hsl : s;
            return `hsla(${h}, ${sl}%, ${l}%, ${finalA.toFixed(2)})`;
        case 'hsva':
            return `hsva(${h}, ${s}%, ${v}%, ${finalA.toFixed(2)})`;
        case 'rgb':
            return `rgb(${r}, ${g}, ${b})`;
        case 'hsl':
            const sl2 = s_hsl !== undefined ? s_hsl : s;
            return `hsl(${h}, ${sl2}%, ${l}%)`;
        case 'hsv':
        default:
            return hex || rgbToHex(r, g, b);
    }
};

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
