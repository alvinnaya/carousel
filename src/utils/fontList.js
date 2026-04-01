/**
 * Popular Google Fonts list.
 * Grouped by category for easy extensibility.
 * When a font is selected, use `loadGoogleFont` to dynamically inject the CSS.
 */
export const FONT_LIST = [
    // Sans-serif
    'Inter',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Lato',
    'Poppins',
    'Nunito',
    'Raleway',
    'Oswald',
    'Source Sans 3',
    'Noto Sans',
    'Ubuntu',
    'Mukta',
    'Rubik',
    'Work Sans',
    'Mulish',
    'Outfit',
    'DM Sans',
    'Figtree',
    'Plus Jakarta Sans',
    'Quicksand',
    'Josefin Sans',
    'Barlow',
    'Exo 2',
    'Cabin',

    // Serif
    'Playfair Display',
    'Lora',
    'Merriweather',
    'PT Serif',
    'Cormorant Garamond',
    'EB Garamond',
    'Libre Baskerville',
    'Noto Serif',
    'DM Serif Display',
    'Spectral',
    'Crimson Text',
    'Bitter',
    'Cardo',

    // Display / Decorative
    'Bebas Neue',
    'Anton',
    'Righteous',
    'Fredoka',
    'Pacifico',
    'Lobster',
    'Titan One',

    // Monospace
    'JetBrains Mono',
    'Source Code Pro',
    'Space Mono',
    'DM Mono',
    'Fira Code',

    // Handwriting
    'Dancing Script',
    'Caveat',
    'Sacramento',
    'Great Vibes',
    'Kalam',
];

/**
 * Extracts unique Google Font families and their used weights from an array of canvas JSON objects.
 * Returns a map: { [fontName: string]: Set<number> }
 */
export const getUsedFonts = (canvases) => {
    if (!Array.isArray(canvases)) return {};
    
    const fontMap = {};

    const addFont = (family, weight) => {
        if (!family) return;
        const normalizedFamily = family.split(',')[0].trim().replace(/['"|]/g, '');
        if (FONT_LIST.includes(normalizedFamily)) {
            if (!fontMap[normalizedFamily]) fontMap[normalizedFamily] = new Set();
            fontMap[normalizedFamily].add(parseInt(weight) || 400);
        }
    };

    const processObject = (obj) => {
        if (!obj) return;
        const type = obj.type ? obj.type.toLowerCase() : '';

        // Handle Text/Textbox objects
        if (type.includes('text') || type.includes('textbox')) {
            addFont(obj.fontFamily, obj.fontWeight);
            
            // Deep scan styles (per-character styling)
            if (obj.styles) {
                try {
                    Object.values(obj.styles).forEach(line => {
                        Object.values(line).forEach(charStyle => {
                            const family = charStyle.fontFamily || obj.fontFamily;
                            const weight = charStyle.fontWeight || obj.fontWeight;
                            addFont(family, weight);
                        });
                    });
                } catch (err) {
                    console.warn('Error scanning deep styles for fonts', err);
                }
            }
        } 
        // Handle Groups recursively
        else if (type === 'group' && Array.isArray(obj.objects)) {
            obj.objects.forEach(processObject);
        }
    };

    canvases.forEach(canvas => {
        if (canvas && canvas.objects) {
            canvas.objects.forEach(processObject);
        }
    });

    return fontMap;
};

// ─── Font Loading Caches ─────────────────────────────────────────────────────
const previewLoaded = new Set();   // Fonts with weight 400 loaded (preview only)
const fullyLoaded = new Set();     // Fonts with ALL weights + italic loaded

/**
 * Lightweight font loader for dropdown previews.
 * Only loads weight 400 (regular) to minimize network usage.
 * Used when the font picker opens and items become visible.
 *
 * @param {string} fontName - The exact font name as it appears in FONT_LIST
 * @returns {Promise<void>}
 */
export const loadFontPreview = async (fontName) => {
    if (previewLoaded.has(fontName) || fullyLoaded.has(fontName)) return;

    const id = `gfont-preview-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(id)) {
        previewLoaded.add(fontName);
        return;
    }

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        fontName
    )}:wght@400&display=swap`;

    document.head.appendChild(link);

    try {
        await new Promise((resolve, reject) => {
            link.onload = resolve;
            link.onerror = reject;
        });
        await document.fonts.load(`400 1em "${fontName}"`);
        await document.fonts.ready;
        previewLoaded.add(fontName);
    } catch (err) {
        console.warn(`Preview load failed for ${fontName}`, err);
    }
};

/**
 * Full font loader for canvas use.
 * Optimized to load only requested weights. If weights array is empty, loads a standard set (100-900).
 *
 * @param {string} fontName - The exact font name as it appears in FONT_LIST
 * @param {number[]} requestedWeights - Array of weights to load (e.g. [400, 700, 900])
 * @returns {Promise<void>}
 */
export const loadGoogleFont = async (fontName, requestedWeights = []) => {
    // Determine weights to load: use requested or default to common ones (400, 700)
    // Requesting invalid weights (e.g. 100) on a font that doesn't support it causes 
    // the entire Google Fonts CSS request to fail!
    let weightsToLoad = requestedWeights.length > 0 
        ? [...new Set(requestedWeights)].sort((a, b) => a - b)
        : [400, 700];

    const weightString = weightsToLoad.join(';');
    const cacheKey = `${fontName}:${weightString}`;

    if (fullyLoaded.has(cacheKey)) return;

    const slug = fontName.replace(/\s+/g, '-').toLowerCase();
    const previewLink = document.getElementById(`gfont-preview-${slug}`);
    if (previewLink) previewLink.remove();

    const fullId = `gfont-full-${slug}-${weightString.replace(/;/g, '-')}`;
    let link = document.getElementById(fullId);

    if (!link) {
        link = document.createElement('link');
        link.id = fullId;
        link.rel = 'stylesheet';
        
        // Prepare weights part of URL
        const wghtPart = weightsToLoad.map(w => `0,${w};1,${w}`).join(';');
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
            fontName
        )}:ital,wght@${wghtPart}&display=swap`;

        document.head.appendChild(link);

        await new Promise((resolve) => {
            link.onload = resolve;
            link.onerror = (err) => {
                console.warn(`Font load failed for ${fontName} with weights ${weightString}`, err);
                resolve();
            };
        });
    }

    try {
        const styles = ['normal', 'italic'];
        await Promise.all(
            weightsToLoad.flatMap(weight =>
                styles.map(style =>
                    document.fonts.load(`${style} ${weight} 1em "${fontName}"`)
                )
            )
        );

        await document.fonts.ready;
        
        // Browsers need a tiny tick to make the font available to Canvas MeasureText API
        await new Promise(resolve => setTimeout(resolve, 50));
        
        fullyLoaded.add(cacheKey);
        previewLoaded.add(fontName);
    } catch (err) {
        console.error(`Failed loading font ${fontName}`, err);
    }
};
