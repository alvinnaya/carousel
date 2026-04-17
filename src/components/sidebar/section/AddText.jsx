import React from 'react';
import { useCanvasContext } from '../../../context/CanvasContext';
import * as fabric from 'fabric';
import { loadGoogleFont } from '../../../utils/fontList';
import { centerObject } from '../../../utils/canvasUtils';
import ElementGallery from '../shared/ElementGallery';

const AddText = () => {
    const { canvas } = useCanvasContext();

    const handleAddText = async (type) => {
        if (!canvas) return;

        // Ensure the font is fully loaded and ready before creating the Fabric text object.
        // Fabric measures text upon creation; if the font isn't loaded, measuring fails.
        await loadGoogleFont('Inter', [400, 500, 700]);

        let text;
        const commonOptions = {
            width: 200,
            textAlign: 'left',
            fontFamily: 'Inter',
        };

        switch (type) {
            case 'heading':
                text = new fabric.Textbox('Add a heading', {
                    ...commonOptions,
                    fontSize: 48,
                    fontWeight: 'bold',
                });
                break;
            case 'subheading':
                text = new fabric.Textbox('Add a subheading', {
                    ...commonOptions,
                    fontSize: 24,
                    fontWeight: '500',
                });
                break;
            case 'body':
                text = new fabric.Textbox('Add body text', {
                    ...commonOptions,
                    fontSize: 16,
                    fontWeight: 'normal',
                });
                break;
            default:
                break;
        }

        if (text) {
            centerObject(canvas, text);
            canvas.add(text);
            canvas.setActiveObject(text);
            canvas.renderAll();
        }
    };

    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Presets</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => handleAddText('heading')}
                        className="w-full py-3 px-4 bg-zinc-50 border border-zinc-100 rounded-lg text-lg font-bold text-zinc-900 hover:bg-zinc-100 transition-colors text-left"
                    >
                        Add a heading
                    </button>
                    <button
                        onClick={() => handleAddText('subheading')}
                        className="w-full py-2 px-4 bg-zinc-50 border border-zinc-100 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors text-left"
                    >
                        Add a subheading
                    </button>
                    <button
                        onClick={() => handleAddText('body')}
                        className="w-full py-2 px-4 bg-zinc-50 border border-zinc-100 rounded-lg text-xs text-zinc-600 hover:bg-zinc-100 transition-colors text-left"
                    >
                        Add body text
                    </button>
                </div>
            </section>

            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Text Styles</h3>
                <ElementGallery category="Text" emptyMessage="No text styles saved" />
            </section>
        </div>
    );
};

export default AddText;
