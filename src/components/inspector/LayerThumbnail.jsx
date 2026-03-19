import React from 'react';

/**
 * LayerThumbnail - Renders a small static preview of a canvas state using an image.
 * @param {string} previewUrl - The data URL of the canvas preview.
 */
const LayerThumbnail = React.memo(({ previewUrl }) => {
    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{backgroundColor: 'var(--bg-surface)'}}>
            {previewUrl ? (
                <img
                    src={previewUrl}
                    alt="Layer Preview"
                    className="w-full h-full object-contain p-1 drop-shadow-sm"
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full bg-zinc-50">
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-400 animate-spin" />
                </div>
            )}
        </div>
    );
});

export default LayerThumbnail;
