import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CanvasContext = createContext(undefined);

export const CanvasProvider = ({ children }) => {
  const [canvas, setCanvas] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [canvases, setCanvases] = useState([{}]); // Array of canvas JSON objects
  const [previews, setPreviews] = useState(['']); // Array of data URLs for thumbnails
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);
  const [activeTool, setActiveTool] = useState(null);
  const [activeSubView, setActiveSubView] = useState(null);
  const [activeObjectSrc, setActiveObjectSrc] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [swatches, setSwatches] = useState([
    '#000000', '#FFFFFF', '#FF3B30', '#FF9500'
  ]);
  const [gradientSwatches, setGradientSwatches] = useState([
    { type: 'linear', angle: 45, stops: [{ offset: 0, color: '#FF9A9E' }, { offset: 1, color: '#FECFEF' }] },
    { type: 'linear', angle: 120, stops: [{ offset: 0, color: '#a18cd1' }, { offset: 1, color: '#fbc2eb' }] },
    { type: 'linear', angle: 90, stops: [{ offset: 0, color: '#ff9a44' }, { offset: 1, color: '#fc6076' }] },
    { type: 'radial', angle: 0, stops: [{ offset: 0, color: '#f6d365' }, { offset: 1, color: '#fda085' }] },
  ]);
  const [histories, setHistories] = useState([{ past: [], future: [] }]); // Per-canvas history stacks
  const isInternalAction = useRef(false);

  // Keep histories in sync with canvases
  useEffect(() => {
    setHistories((prev) => {
      // If same length, assume it might be a reorder or internal change handled elsewhere
      // but actually we want to handle reorders too if possible.
      // However, a simple length sync is a good start.
      if (prev.length === canvases.length) return prev;

      if (canvases.length > prev.length) {
        // Canvases added
        const diff = canvases.length - prev.length;
        const newEntries = Array(diff).fill(null).map(() => ({ past: [], future: [] }));
        return [...prev, ...newEntries];
      } else {
        // Canvases removed
        return prev.slice(0, canvases.length);
      }
    });
  }, [canvases.length]); // Only sync when length changes for now to avoid complexity with reorders

  const MAX_SWATCHES = 13;

  const addSwatch = (color) => {
    if (!color || swatches.includes(color)) return;
    setSwatches((prev) => {
      const next = [...prev, color];
      if (next.length > MAX_SWATCHES) {
        return next.slice(1); // Remove oldest
      }
      return next;
    });
  };

  const updateSwatch = (index, color) => {
    setSwatches((prev) => {
      const newSwatches = [...prev];
      newSwatches[index] = color;
      return newSwatches;
    });
  };

  const addGradientSwatch = (gradient) => {
    if (!gradient) return;
    setGradientSwatches((prev) => {
      const next = [...prev, gradient];
      if (next.length > MAX_SWATCHES) {
        return next.slice(1);
      }
      return next;
    });
  };

  const updateGradientSwatch = (index, gradient) => {
    setGradientSwatches((prev) => {
      const next = [...prev];
      next[index] = gradient;
      return next;
    });
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

  const recordHistory = (index, state) => {
    setHistories((prev) => {
      const newHistories = [...prev];
      if (!newHistories[index]) {
        newHistories[index] = { past: [], future: [] };
      }
      const currentPast = newHistories[index].past;
      // Limit history to 50 steps
      const newPast = [...currentPast.slice(-49), state];
      newHistories[index] = {
        past: newPast,
        future: [] // Clear redo stack on new action
      };
      return newHistories;
    });
  };

  const undo = (index) => {
    const history = histories[index];
    if (!history || history.past.length <= 1) return; // Need current + previous

    const newPast = [...history.past];
    const currentState = newPast.pop();
    const previousState = newPast[newPast.length - 1];

    setHistories((prev) => {
      const newHistories = [...prev];
      newHistories[index] = {
        past: newPast,
        future: [currentState, ...history.future]
      };
      return newHistories;
    });

    // Update active index state for thumbnails/layers
    updateCanvasState(index, previousState);

    // Physical canvas update
    if (index === activeCanvasIndex && canvas) {
      isInternalAction.current = true;
      canvas.loadFromJSON(previousState).then(() => {
        canvas.renderAll();
        setTimeout(() => {
          isInternalAction.current = false;
        }, 100); // Small delay to catch any trailing events
      });
    }
  };

  const redo = (index) => {
    const history = histories[index];
    if (!history || history.future.length === 0) return;

    const newFuture = [...history.future];
    const nextState = newFuture.shift();

    setHistories((prev) => {
      const newHistories = [...prev];
      newHistories[index] = {
        past: [...history.past, nextState],
        future: newFuture
      };
      return newHistories;
    });

    updateCanvasState(index, nextState);

    if (index === activeCanvasIndex && canvas) {
      isInternalAction.current = true;
      canvas.loadFromJSON(nextState).then(() => {
        canvas.renderAll();
        setTimeout(() => {
          isInternalAction.current = false;
        }, 100);
      });
    }
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
        updateSwatch,
        gradientSwatches,
        addGradientSwatch,
        updateGradientSwatch,
        clipboard,
        setClipboard,
        histories,
        setHistories,
        recordHistory,
        undo,
        redo,
        isInternalAction,
        activeTool,
        setActiveTool,
        activeSubView,
        setActiveSubView,
        activeObjectSrc,
        setActiveObjectSrc
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
