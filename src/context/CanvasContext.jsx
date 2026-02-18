import { createContext, useContext, useState } from 'react';

const CanvasContext = createContext(undefined);

export const CanvasProvider = ({ children }) => {
  const [canvas, setCanvas] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [canvases, setCanvases] = useState([{}]); // Array of canvas JSON objects
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);

  const updateCanvasState = (index, json) => {
    setCanvases((prev) => {
      const newCanvases = [...prev];
      newCanvases[index] = json;
      return newCanvases;
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
        activeCanvasIndex,
        setActiveCanvasIndex,
        updateCanvasState,
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
