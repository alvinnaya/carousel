import React, { useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import * as fabric from 'fabric';

const AddImage = () => {
    const { canvas } = useCanvasContext();
    const fileInputRef = useRef(null);

    const handleAddImage = (url) => {
        if (!canvas) return;

        fabric.FabricImage.fromURL(url, {
            crossOrigin: 'anonymous'
        }).then((img) => {
            img.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center',
                scaleX: 0.5,
                scaleY: 0.5,
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        });
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (f) => {
            const data = f.target.result;
            handleAddImage(data);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
            >
                Upload Image
            </button>

            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Library</h3>
                <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            onClick={() => handleAddImage(`https://picsum.photos/seed/${i + 10}/800`)}
                            className="aspect-square rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden cursor-pointer hover:border-zinc-300 transition-all"
                        >
                            <img
                                src={`https://picsum.photos/seed/${i + 10}/200`}
                                alt="placeholder"
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AddImage;

