import React from 'react';

/**
 * LayerThumbnail - Renders a small static preview of a canvas state using an image.
 * @param {string} previewUrl - The data URL of the canvas preview.
 */
const LayerThumbnail = React.memo(({ previewUrl }) => {
    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden mus-bg-surface">
            {previewUrl ? (
                <img
                    src={previewUrl}
                    alt="Layer Preview"
                    className="w-full h-full object-contain p-1 mus-drop-shadow-sm"
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full mus-bg-main">
                    <div className="w-8 h-8 rounded-full border border-[var(--border-light)] border-t-[var(--accent)] animate-spin" />
                </div>
            )}
        </div>
    );
});

export default LayerThumbnail;
