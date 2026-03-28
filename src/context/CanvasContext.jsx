import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import pageService from '../api/pageService';
import { getUsedFonts, loadGoogleFont } from '../utils/fontList';

const CanvasContext = createContext(undefined);

export const CanvasProvider = ({ children, initialPages = [], designInfo = null }) => {
  const [canvas, setCanvas] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [canvases, setCanvases] = useState(() => {
    // Transform PageDto[] to CanvasJSON[] with metadata
    return initialPages.map(p => {
      let parsed = {};
      try {
        parsed = p.canvasJson ? JSON.parse(p.canvasJson) : {};
      } catch (e) {
        console.error('Failed to parse canvasJson', e);
      }
      return {
        ...parsed,
        _pageId: p.id || p.Id,
        _order: typeof p.order !== 'undefined' ? p.order : p.Order,
        width: parsed.width || 1080,
        height: parsed.height || 1080
      };
    });
  });
  const [previews, setPreviews] = useState(initialPages.map(() => '')); // Array of data URLs for thumbnails
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
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
  const [isFontsReady, setIsFontsReady] = useState(false);
  const isInternalAction = useRef(false);
  const viewportRef = useRef(null);
  const scaleRef = useRef(scale);
  const translateRef = useRef(translate);
  const canvasesRef = useRef(canvases);

  useEffect(() => {
    canvasesRef.current = canvases;
  }, [canvases]);

  // Centralized Font Pre-loading: Extract all fonts from initialPages and load them once.
  useEffect(() => {
    const loadRequiredFonts = async () => {
      const fontMap = getUsedFonts(canvases);
      
      // Always ensure "Inter" is loaded (common project default and UI font)
      if (!fontMap['Inter']) fontMap['Inter'] = new Set();
      fontMap['Inter'].add(400);
      fontMap['Inter'].add(700);

      const fontEntries = Object.entries(fontMap);

      if (fontEntries.length > 0) {
        console.log('Centralized Optimized Pre-loading design fonts:', fontMap);
        try {
          await Promise.all(fontEntries.map(([font, weights]) =>
            loadGoogleFont(font, Array.from(weights))
          ));
          await document.fonts.ready;
          console.log('Design fonts pre-loaded successfully');
        } catch (err) {
          console.error('Font pre-loading failed:', err);
        }
      }
      setIsFontsReady(true);
    };

    loadRequiredFonts();
  }, []); // Only on mount

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

  const saveTimeoutRef = useRef(null);
  
  // Custom setters that update Refs instantly but state debounced
  const syncTimeoutRef = useRef({ scale: null, translate: null });

  const setScaleOptimized = useCallback((update) => {
    const newScale = typeof update === 'function' ? update(scaleRef.current) : update;
    scaleRef.current = newScale;

    // Dispatch fast event for zero-latency UI feedback
    window.dispatchEvent(new CustomEvent('canvas:scale:fast', { detail: newScale }));

    if (syncTimeoutRef.current.scale) clearTimeout(syncTimeoutRef.current.scale);
    syncTimeoutRef.current.scale = setTimeout(() => {
      setScale(newScale);
    }, 150); // Slightly longer debounce to ensure interaction priority
  }, []);

  const setTranslateOptimized = useCallback((update) => {
    const currentTranslate = translateRef.current;
    const newTranslate = typeof update === 'function' ? update(currentTranslate) : update;
    translateRef.current = newTranslate;

    // Dispatch fast event for zero-latency UI feedback
    window.dispatchEvent(new CustomEvent('canvas:translate:fast', { detail: newTranslate }));

    if (syncTimeoutRef.current.translate) clearTimeout(syncTimeoutRef.current.translate);
    syncTimeoutRef.current.translate = setTimeout(() => {
      setTranslate(newTranslate);
    }, 150);
  }, []);

  const debouncedSave = useCallback((pageId, json, order) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Autosaving page:', pageId);
        setIsSaving(true);
        await pageService.update(pageId, {
          canvasJson: JSON.stringify(json),
          order
        });
        console.log('Autosave successful for page:', pageId);
      } catch (err) {
        console.error('Autosave failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 2000); // 2 second debounce
  }, []);

  const updateCanvasState = useCallback(async (index, json) => {
    const pageId = canvasesRef.current[index]?._pageId;
    const order = canvasesRef.current[index]?._order;

    setCanvases((prev) => {
      const newCanvases = [...prev];
      if (newCanvases[index]) {
        // Merge the new JSON into the existing object, preserving metadata
        newCanvases[index] = { ...newCanvases[index], ...json };
      }
      return newCanvases;
    });

    // Autosave logic
    if (pageId && !isInternalAction.current) {
      debouncedSave(pageId, json, order);
    }
  }, [debouncedSave]);

  const updatePreview = (index, dataUrl) => {
    setPreviews((prev) => {
      const newPreviews = [...prev];
      if (index < newPreviews.length) {
        newPreviews[index] = dataUrl;
      }
      return newPreviews;
    });
  };

  const addPage = async (initialJson = null, insertAt = null) => {
    const designId = designInfo?.id;
    if (!designId) return;

    const width = initialJson?.width || 1080;
    const height = initialJson?.height || 1080;
    const index = insertAt !== null ? insertAt : canvases.length;

    const newCanvas = {
      objects: [],
      ...(initialJson || {}),
      width,
      height
    };

    // Optimistic UI update
    setCanvases(prev => {
      const next = [...prev];
      next.splice(index, 0, newCanvas);
      return next;
    });
    setPreviews(prev => {
      const next = [...prev];
      next.splice(index, 0, '');
      return next;
    });

    if (insertAt !== null || index === canvases.length) {
      setActiveCanvasIndex(index);
    }

    try {
      const response = await pageService.create(designId, {
        order: index,
        canvasJson: JSON.stringify(newCanvas)
      });
      if (response.success && response.data) {
        const newId = response.data.id || response.data.Id;
        const newOrder = typeof response.data.order !== 'undefined' ? response.data.order : response.data.Order;

        setCanvases(prev => {
          const next = [...prev];
          if (next[index]) {
            next[index] = { ...next[index], _pageId: newId, _order: newOrder };
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to create page', err);
    }
  };

  const duplicatePage = async (index) => {
    const source = canvases[index];
    if (!source) return;

    // Clone without internal metadata
    const { _pageId, _order, ...canvasData } = source;
    await addPage(JSON.parse(JSON.stringify(canvasData)), index + 1);
  };

  const removePage = async (index) => {
    if (canvases.length <= 1) return;

    const pageToBtn = canvases[index];
    const pageId = pageToBtn?._pageId;

    // Optimistic remove
    setCanvases(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));

    if (activeCanvasIndex === index) {
      setActiveCanvasIndex(Math.max(0, index - 1));
    } else if (activeCanvasIndex > index) {
      setActiveCanvasIndex(activeCanvasIndex - 1);
    }

    if (pageId) {
      try {
        await pageService.delete(pageId);
      } catch (err) {
        console.error('Failed to delete page', err);
      }
    }
  };

  const movePage = async (fromIndex, toIndex) => {
    let updatedCanvases = [];
    setCanvases(prev => {
      const next = [...prev];
      const [movedItem] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedItem);
      
      // Update local _order property based on new index
      updatedCanvases = next.map((canvas, index) => ({
        ...canvas,
        _order: index
      }));
      
      return updatedCanvases;
    });
    setPreviews(prev => {
      const next = [...prev];
      const [movedItem] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedItem);
      return next;
    });

    // Update active index
    if (activeCanvasIndex === fromIndex) {
      setActiveCanvasIndex(toIndex);
    } else if (fromIndex < toIndex && activeCanvasIndex > fromIndex && activeCanvasIndex <= toIndex) {
      setActiveCanvasIndex(activeCanvasIndex - 1);
    } else if (fromIndex > toIndex && activeCanvasIndex >= toIndex && activeCanvasIndex < fromIndex) {
      setActiveCanvasIndex(activeCanvasIndex + 1);
    }

    // Backend update for orders
    const designId = designInfo?.id;
    if (designId && updatedCanvases.length > 0) {
      const pageOrders = updatedCanvases
        .filter(c => c._pageId) // Only send pages that exist in DB
        .map(c => ({
          id: c._pageId,
          order: c._order
        }));

      if (pageOrders.length > 0) {
        try {
          await pageService.reorder(designId, pageOrders);
          console.log('Pages reordered successfully');
        } catch (err) {
          console.error('Failed to reorder pages backend', err);
          // In a real app, you might want to revert the UI if this fails
        }
      }
    }
  };

  const recordHistory = useCallback((index, state) => {
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
  }, []);

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
        setScale: setScaleOptimized, // Optimized setter
        scaleRef,                   // Shared Ref
        translate,
        setTranslate: setTranslateOptimized, // Optimized setter
        translateRef,                // Shared Ref
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
        setActiveObjectSrc,
        isSaving,
        addPage,
        duplicatePage,
        removePage,
        movePage,
        isFontsReady,
        viewportRef
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
