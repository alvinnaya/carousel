import React, { useState, useEffect } from 'react';
import { useCanvasContext } from '../../../context/CanvasContext';
import * as fabric from 'fabric';
import { Loader2 } from 'lucide-react';

import { loadGoogleFont, getUsedFonts } from '../../../utils/fontList';
import textTemplateService from '../../../api/textTemplateService';
import { centerObject } from '../../../utils/canvasUtils';

/**
 * ElementGallery — A reusable sidebar gallery component that fetches, displays,
 * and injects design elements from the unified API.
 *
 * @param {string} category - 'Text', 'Shape', or 'Group'
 * @param {string} emptyMessage - Custom message when no items are found
 */
const ElementGallery = ({ category, emptyMessage = 'No styles saved' }) => {
    const { canvas } = useCanvasContext();
    const [elements, setElements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);

    useEffect(() => {
        const fetchElements = async () => {
            try {
                setLoading(true);
                const response = await textTemplateService.listTextTemplates(1, 50, category);
                if (response && response.success) {
                    setElements(response.data?.items || response.data || []);
                }
            } catch (err) {
                console.error(`Failed to load ${category} elements:`, err);
            } finally {
                setLoading(false);
            }
        };
        fetchElements();
    }, [category]);

    /**
     * Injects a JSON-type element (canvas composition) onto the canvas.
     */
    const injectJSON = async (data) => {
        const jsonStr = data.canvasJson;
        const parsedJson = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;

        // Pre-load all fonts used in the composition
        const usedFonts = getUsedFonts(
            parsedJson.objects && parsedJson.type !== 'group'
                ? [parsedJson]
                : [{ objects: [parsedJson] }]
        );
        const fontPromises = Object.entries(usedFonts).map(([font, weights]) =>
            loadGoogleFont(font, Array.from(weights))
        );
        if (fontPromises.length > 0) {
            await Promise.all(fontPromises);
        }

        // Determine what to enliven
        const objectsToEnliven = (parsedJson.objects && parsedJson.type !== 'group')
            ? parsedJson.objects
            : [parsedJson];

        const enlivenedObjects = await fabric.util.enlivenObjects(objectsToEnliven);
        if (!enlivenedObjects || enlivenedObjects.length === 0) return;

        let finalObj;
        if (enlivenedObjects.length > 1 || (enlivenedObjects.length === 1 && enlivenedObjects[0].type !== 'group')) {
            finalObj = new fabric.Group(enlivenedObjects);
        } else {
            finalObj = enlivenedObjects[0];
        }

        if (finalObj) {
            centerObject(canvas, finalObj);
            finalObj.set({
                interactive: true,
                subTargetCheck: true
            });
            canvas.add(finalObj);
            canvas.setActiveObject(finalObj);
            canvas.renderAll();
        }
    };

    /**
     * Injects an SVG-type element (physical asset file) onto the canvas.
     */
    const injectSVG = async (data) => {
        return new Promise((resolve, reject) => {
            fabric.loadSVGFromURL(data.assetUrl, (objects, options) => {
                if (!objects || objects.length === 0) {
                    reject(new Error('Failed to load SVG'));
                    return;
                }

                const obj = fabric.util.groupSVGElements(objects, options);
                centerObject(canvas, obj);
                canvas.add(obj);
                canvas.setActiveObject(obj);
                canvas.renderAll();
                resolve();
            });
        });
    };

    /**
     * Handles click on an element thumbnail.
     * Branches based on element.type (JSON vs SVG).
     */
    const handleElementClick = async (element) => {
        if (!canvas || addingId) return;

        try {
            setAddingId(element.id);

            // Fetch full element detail (includes canvasJson or assetUrl)
            const response = await textTemplateService.getTextTemplate(element.id);

            if (response && response.success && response.data) {
                const data = response.data;

                if (data.type === 'SVG' && data.assetUrl) {
                    await injectSVG(data);
                } else if (data.canvasJson) {
                    await injectJSON(data);
                }
            }
        } catch (error) {
            console.error('Failed to add element:', error);
        } finally {
            setAddingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-zinc-400" size={24} />
            </div>
        );
    }

    if (elements.length === 0) {
        return (
            <div className="text-center p-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{emptyMessage}</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {elements.map(element => (
                <div
                    key={element.id}
                    onClick={() => handleElementClick(element)}
                    className="aspect-[4/3] rounded-lg border border-zinc-100 bg-zinc-50 relative overflow-hidden cursor-pointer hover:border-zinc-300 transition-all flex items-center justify-center p-2"
                >
                    {element.previewUrl ? (
                        <img src={element.previewUrl} alt={element.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <span className="text-[10px] font-bold text-zinc-400 text-center">{element.name}</span>
                    )}

                    {addingId === element.id && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                            <Loader2 className="animate-spin text-[var(--accent)]" size={20} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ElementGallery;
