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
 * Injects a Google Font stylesheet into the document head if not already loaded.
 * Loads all weights 100–900 to support the font weight selector.
 * Resolves when the font has finished loading via the CSS Font Loading API.
 *
 * @param {string} fontName - The exact font name as it appears in FONT_LIST
 * @returns {Promise<void>}
 */
const loadedFonts = new Set();

export const loadGoogleFont = async (fontName) => {
    if (loadedFonts.has(fontName)) return;

    const id = `gfont-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    let link = document.getElementById(id);

    if (!link) {
        link = document.createElement('link');
        link.id = id;
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
        const weights = [
            '100', '200', '300', '400', '500',
            '600', '700', '800', '900'
        ];

        const styles = ['normal', 'italic'];

        // Force load semua kombinasi
        await Promise.all(
            weights.flatMap(weight =>
                styles.map(style =>
                    document.fonts.load(
                        `${style} ${weight} 1em "${fontName}"`
                    )
                )
            )
        );

        await document.fonts.ready;

        loadedFonts.add(fontName);
    } catch (err) {
        console.error(`Failed loading font ${fontName}`, err);
    }
};
