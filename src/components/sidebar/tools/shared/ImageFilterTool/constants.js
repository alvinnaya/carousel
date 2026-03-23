export const FILTER_CATEGORIES = [
    {
        name: 'Classic',
        filters: [
            { name: 'None', css: 'none', fabricValues: {} },
            { name: 'Portrait', css: 'contrast(1.1) brightness(1.05) saturate(0.9) sepia(0.1)', fabricValues: { contrast: 0.1, brightness: 0.05, saturation: -0.1 } },
            { name: 'Brighten', css: 'brightness(1.5)', fabricValues: { brightness: 0.5 } },
            { name: 'Natural warmth', css: 'sepia(0.3) brightness(1.1) contrast(1.1)', fabricValues: { brightness: 0.1, contrast: 0.1, saturation: 0.1 } },
            { name: 'Cool tone', css: 'hue-rotate(180deg) brightness(1.05) saturate(0.9)', fabricValues: { brightness: 0.05, saturation: -0.1, hue: 180 } },
            { name: 'Soft contrast', css: 'contrast(1.3) brightness(0.95)', fabricValues: { contrast: 0.3, brightness: -0.05 } },
            { name: 'Clarity', css: 'contrast(1.6) saturate(1.1)', fabricValues: { contrast: 0.6, saturation: 0.1 } },
            { name: 'Sunbath', css: 'saturate(2) sepia(0.2) brightness(1.1)', fabricValues: { saturation: 1.0, brightness: 0.1, contrast: 0.1 } },
        ]
    },
    {
        name: 'Vibrant',
        filters: [
            { name: 'Vivid', css: 'saturate(2.5)', fabricValues: { saturation: 1.5 } },
            { name: 'Radiance', css: 'brightness(1.2) contrast(1.2) saturate(1.5)', fabricValues: { brightness: 0.2, contrast: 0.2, saturation: 0.5 } },
            { name: 'Breeze', css: 'hue-rotate(20deg) saturate(1.2) brightness(1.1)', fabricValues: { hue: 20, saturation: 0.2, brightness: 0.1 } },
            { name: 'Color punch', css: 'contrast(1.5) saturate(1.8)', fabricValues: { contrast: 0.5, saturation: 0.8 } },
            { name: 'Dreamy', css: 'blur(1px) brightness(1.2) contrast(0.9)', fabricValues: { blur: 0.05, brightness: 0.2, contrast: -0.1 } },
            { name: 'Evergreen', css: 'hue-rotate(-40deg) saturate(1.5) contrast(1.1)', fabricValues: { hue: -40, saturation: 0.5, contrast: 0.1 } },
        ]
    }
];

export const ALL_PRESET_FILTERS = FILTER_CATEGORIES.flatMap(c => c.filters);
export const FILTERS = ALL_PRESET_FILTERS; // Backward compatibility

export const SLIDER_GROUPS = [
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
            { key: 'hue', label: 'Hue', displayMin: -180, displayMax: 180, displayDefault: 0, fabricDefault: 0 },
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

export const ALL_SLIDERS = SLIDER_GROUPS.flatMap(g => g.sliders);

export const DEFAULT_CUSTOM = Object.fromEntries(ALL_SLIDERS.map(s => [s.key, s.displayDefault]));

export const GAMMA_COLORS = { gammaR: '#e25d5d', gammaG: '#5db87a', gammaB: '#5d8ee2' };

export const toFabric = (key, display) => {
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

export const fromFabric = (key, stored) => {
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
export const getEffectiveFilters = (presetName, intensityPercent) => {
    const intensity = intensityPercent / 100;
    const preset = ALL_PRESET_FILTERS.find(f => f.name === presetName) || { fabricValues: {} };
    const fVals = preset.fabricValues;
    const result = {};

    // Standard sliders (identity 0)
    ['brightness', 'contrast', 'saturation', 'hue', 'exposure', 'vibrance', 'blur', 'noise'].forEach(key => {
        if (fVals[key] !== undefined) {
            result[key] = fVals[key] * intensity;
        }
    });

    // Special sliders (identity 1)
    if (fVals.pixelate !== undefined) {
        result.pixelate = 1 + (fVals.pixelate - 1) * intensity;
    }
    if (fVals.gammaR !== undefined) result.gammaR = 1 + (fVals.gammaR - 1) * intensity;
    if (fVals.gammaG !== undefined) result.gammaG = 1 + (fVals.gammaG - 1) * intensity;
    if (fVals.gammaB !== undefined) result.gammaB = 1 + (fVals.gammaB - 1) * intensity;
    
    // Also include colorMatrix if explicitly defined in preset
    if (fVals.colorMatrix) {
        result.colorMatrix = fVals.colorMatrix;
    }

    return result;
};
