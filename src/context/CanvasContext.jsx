import { createContext, useContext, useState } from 'react';

const CanvasContext = createContext(undefined);

export const CanvasProvider = ({ children }) => {
  const [canvas, setCanvas] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [canvases, setCanvases] = useState([{}]); // Array of canvas JSON objects
  const [previews, setPreviews] = useState(['']); // Array of data URLs for thumbnails
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);
  const [swatches, setSwatches] = useState([
    '#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'
  ]);

  const MAX_SWATCHES = 13;

  const addSwatch = (color) => {
    if (!color || swatches.includes(color) || swatches.length >= MAX_SWATCHES) return;
    setSwatches((prev) => [...prev, color]);
  };

  const updateCanvasState = (index, json) => {
    setCanvases((prev) => {
      const newCanvases = [...prev];
      newCanvases[index] = json;
      return newCanvases;
    });
  };

  const updatePreview = (index, dataUrl) => {
    setPreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews[index] = dataUrl;
      return newPreviews;
    });
  };

  return (
    <CanvasContext.Provider
      value={{
        canvas,
        setCanvas,
        scale,
        setScale,
        translate,
        setTranslate,
        canvases,
        setCanvases,
        previews,
        setPreviews,
        activeCanvasIndex,
        setActiveCanvasIndex,
        updateCanvasState,
        updatePreview,
        swatches,
        addSwatch,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);

  if (!context) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }

  return context;
};
