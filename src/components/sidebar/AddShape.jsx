import React from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import * as fabric from 'fabric';

const AddShape = () => {
    const { canvas } = useCanvasContext();

    const handleAddShape = (type) => {
        if (!canvas) return;

        let shape;
        const commonOptions = {
            left: canvas.width / 2 - 50,
            top: canvas.height / 2 - 50,
            fill: '#4f46e5',
            width: 100,
            height: 100,
        };

        switch (type) {
            case 'rect':
                shape = new fabric.Rect({
                    ...commonOptions,
                    rx: 8,
                    ry: 8,
                });
                break;
            case 'circle':
                shape = new fabric.Circle({
                    ...commonOptions,
                    radius: 50,
                });
                break;
            case 'triangle':
                shape = new fabric.Triangle({
                    ...commonOptions,
                });
                break;
            case 'line':
                shape = new fabric.Line([50, 50, 150, 50], {
                    left: canvas.width / 2 - 50,
                    top: canvas.height / 2,
                    stroke: '#4f46e5',
                    strokeWidth: 4,
                });
                break;
            case 'hexagon':
                shape = new fabric.Polygon([
                    { x: 50, y: 0 },
                    { x: 100, y: 30 },
                    { x: 100, y: 70 },
                    { x: 50, y: 100 },
                    { x: 0, y: 70 },
                    { x: 0, y: 30 }
                ], {
                    ...commonOptions,
                });
                break;
            case 'star':
                // Simplified star for demo
                shape = new fabric.Polygon([
                    { x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 },
                    { x: 68, y: 57 }, { x: 79, y: 91 }, { x: 50, y: 70 },
                    { x: 21, y: 91 }, { x: 32, y: 57 }, { x: 2, y: 35 },
                    { x: 39, y: 35 }
                ], {
                    ...commonOptions,
                });
                break;
            default:
                break;
        }

        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
        }
    };

    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Basic Shapes</h3>
                <div className="grid grid-cols-3 gap-3">
                    {['rect', 'circle', 'triangle', 'line', 'star', 'hexagon'].map((shape) => (
                        <div
                            key={shape}
                            onClick={() => handleAddShape(shape)}
                            className="aspect-square rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center cursor-pointer hover:border-zinc-300 transition-all p-3"
                        >
                            <div className={`w-full h-full border-2 border-zinc-400 ${shape === 'circle' ? 'rounded-full' : ''}`} />
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Icons</h3>
                <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="aspect-square rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 cursor-pointer hover:border-zinc-300 transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                            </svg>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AddShape;

