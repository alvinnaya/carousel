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
 * Loads ALL weights (100–900) + italic to support the weight selector and italic toggle.
 * Replaces the preview stylesheet if one exists to avoid duplicate requests.
 *
 * @param {string} fontName - The exact font name as it appears in FONT_LIST
 * @returns {Promise<void>}
 */
export const loadGoogleFont = async (fontName) => {
    if (fullyLoaded.has(fontName)) return;

    const slug = fontName.replace(/\s+/g, '-').toLowerCase();

    // Remove the lightweight preview link if it exists (will be replaced by full one)
    const previewLink = document.getElementById(`gfont-preview-${slug}`);
    if (previewLink) previewLink.remove();

    const fullId = `gfont-full-${slug}`;
    let link = document.getElementById(fullId);

    if (!link) {
        link = document.createElement('link');
        link.id = fullId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
            fontName
        )}:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`;

        document.head.appendChild(link);

        await new Promise((resolve, reject) => {
            link.onload = resolve;
            link.onerror = reject;
        });
    }

    try {
        const weights = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
        const styles = ['normal', 'italic'];

        // Force load semua kombinasi weight × style
        await Promise.all(
            weights.flatMap(weight =>
                styles.map(style =>
                    document.fonts.load(`${style} ${weight} 1em "${fontName}"`)
                )
            )
        );

        await document.fonts.ready;
        fullyLoaded.add(fontName);
        previewLoaded.add(fontName); // Mark preview as loaded too
    } catch (err) {
        console.error(`Failed loading font ${fontName}`, err);
    }
};
