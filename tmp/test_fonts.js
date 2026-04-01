
const FONT_LIST = [
    'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins', 'Nunito', 'Raleway', 'Oswald',
    'Playfair Display', 'Lora', 'Merriweather'
];

const getUsedFonts = (canvases) => {
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

        if (type.includes('text') || type.includes('textbox')) {
            addFont(obj.fontFamily, obj.fontWeight);
            if (obj.styles) {
                try {
                    Object.values(obj.styles).forEach(line => {
                        Object.values(line).forEach(charStyle => {
                            const family = charStyle.fontFamily || obj.fontFamily;
                            const weight = charStyle.fontWeight || obj.fontWeight;
                            addFont(family, weight);
                        });
                    });
                } catch (err) {}
            }
        } 
        else if (type === 'group' && Array.isArray(obj.objects)) {
            obj.objects.forEach(processObject);
        }
    };

    canvases.forEach(canvas => {
        if (canvas && canvas.objects) {
            canvas.objects.forEach(processObject);
        }
    });

    // Convert Sets to Arrays for easier comparison in tests
    const result = {};
    for (const font in fontMap) {
        result[font] = Array.from(fontMap[font]).sort();
    }
    return result;
};

// TEST CASE
const mockCanvases = [
    {
        objects: [
            { type: 'textbox', fontFamily: 'Inter', fontWeight: 700 },
            {
                type: 'group',
                objects: [
                    { type: 'text', fontFamily: 'Roboto', fontWeight: 400 },
                    {
                        type: 'group', // Nested group
                        objects: [
                            { type: 'textbox', fontFamily: 'Montserrat', fontWeight: 900 }
                        ]
                    }
                ]
            }
        ]
    }
];

const result = getUsedFonts(mockCanvases);
console.log('Detected Fonts:', JSON.stringify(result, null, 2));

const expected = {
    "Inter": [700],
    "Roboto": [400],
    "Montserrat": [900]
};

if (JSON.stringify(result) === JSON.stringify(expected)) {
    console.log('SUCCESS: All fonts detected correctly, including nested groups.');
    process.exit(0);
} else {
    console.error('FAILURE: Detected fonts do not match expected output.');
    process.exit(1);
}
