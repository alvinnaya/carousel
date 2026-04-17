import pageService from '../api/pageService';
import * as fabric from 'fabric';
import { getUsedFonts, loadGoogleFont } from './fontList';

// Placeholder untuk gambar yang gagal dimuat (404, CORS, dsb)
const BROKEN_IMAGE_SVG = `
<svg width="200" height="200" viewBox="0 0 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#f3f4f6"/>
  <path d="M70 70 L130 130 M130 70 L70 130" stroke="#d1d5db" stroke-width="8" stroke-linecap="round"/>
  <rect x="40" y="40" width="120" height="120" rx="10" stroke="#d1d5db" stroke-width="4" fill="none"/>
  <text x="100" y="170" font-family="sans-serif" font-size="14" font-weight="bold" fill="#9ca3af" text-anchor="middle">IMAGE NOT FOUND</text>
</svg>`;
export const BROKEN_IMAGE_URL = `data:image/svg+xml;base64,${btoa(BROKEN_IMAGE_SVG)}`;

/**
 * Mendeteksi apakah URL adalah signed URL R2 yang sudah expired atau akan expired.
 */
export const isSignedUrlExpired = (url) => {
    if (!url || !url.includes('X-Amz-Date')) return false;
    try {
        const urlObj = new URL(url);
        const dateStr = urlObj.searchParams.get('X-Amz-Date');
        const expiresStr = urlObj.searchParams.get('X-Amz-Expires');
        if (!dateStr || !expiresStr) return true;

        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(9, 11);
        const min = dateStr.substring(11, 13);
        const sec = dateStr.substring(13, 15);

        const createdDate = new Date(Date.UTC(year, month - 1, day, hour, min, sec));
        const expiresMs = parseInt(expiresStr) * 1000;
        const now = new Date();

        return now.getTime() > (createdDate.getTime() + expiresMs - 300000);
    } catch (e) {
        return true;
    }
};

/**
 * Mengekstrak object key dari URL R2 (signed atau public jika ada).
 */
export const extractObjectKey = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        if (path.startsWith('/')) return path.substring(1);
        return path;
    } catch (e) {
        return null;
    }
};

/**
 * Mendeteksi apakah kanvas mengandung gambar dengan URL yang sudah expired.
 */
export const hasExpiredImages = (canvasJson) => {
    if (!canvasJson || !canvasJson.objects) return false;
    return canvasJson.objects.some(obj =>
        (obj.type === 'image' || obj.type === 'FabricImage') && isSignedUrlExpired(obj.src)
    );
};

/**
 * Memperbarui URL gambar dalam JSON kanvas jika sudah expired.
 * @deprecated Gunakan refreshPagesImageUrls dengan designId untuk re-hydration dari API utama.
 */
export const refreshCanvasImageUrls = async (canvasJson) => {
    return canvasJson; // No longer performs manual mapping to avoid getMyImages inefficiency
};

/**
 * Memperbarui URL gambar dalam array halaman desain.
 * Jika ditemukan gambar expired, akan memanggil API GetByDesignId untuk re-hydration otomatis dari Backend.
 */
export const refreshPagesImageUrls = async (pages, designId) => {
    if (!Array.isArray(pages)) return pages;

    // 1. Cek apakah ada yang expired di semua halaman
    let needsRefresh = false;
    for (const page of pages) {
        if (!page.canvasJson) continue;
        try {
            const parsed = typeof page.canvasJson === 'string' ? JSON.parse(page.canvasJson) : page.canvasJson;
            if (hasExpiredImages(parsed)) {
                needsRefresh = true;
                break;
            }
        } catch (e) {
            continue;
        }
    }

    // 2. Jika ada yang expired, panggil API Load JSON utama (Backend Hydration)
    if (needsRefresh && designId) {
        console.log(`[Auto-Heal] Expired images detected, re-fetching design pages for: ${designId}`);
        try {
            const response = await pageService.getByDesignId(designId);
            if (response && response.success && Array.isArray(response.data)) {
                return response.data;
            } else if (Array.isArray(response)) {
                return response;
            }
        } catch (err) {
            console.warn('Failed to auto-refresh pages from API', err);
        }
    }

    return pages;
};

/**
 * Memastikan semua objek gambar memiliki CORS 'anonymous' untuk menghindari Tainted Canvas.
 */
export const ensureCORS = (canvasJson) => {
    if (!canvasJson || !canvasJson.objects) return canvasJson;
    const updatedObjects = canvasJson.objects.map(obj => {
        if (obj.type === 'image' || obj.type === 'FabricImage') {
            return { ...obj, crossOrigin: 'anonymous' };
        }
        return obj;
    });
    return { ...canvasJson, objects: updatedObjects };
};

/**
 * Menerima savedState kanvas (JSON), me-render dengan kualitas tinggi (skala 1x, webp),
 * dan mengembalikan File object yang siap di-upload sebagai template preview.
 */
export const generateHighQualityPreview = async (savedState) => {
    if (!savedState) return null;

    const usedFonts = getUsedFonts([savedState]);
    const fontLoadPromises = Object.entries(usedFonts).map(([fontName, weightsSet]) => {
        return loadGoogleFont(fontName, Array.from(weightsSet));
    });

    if (fontLoadPromises.length > 0) {
        try {
            await Promise.all(fontLoadPromises);
        } catch (err) {
            console.error('Error loading fonts for high-quality preview:', err);
        }
    }

    const offscreenEl = document.createElement('canvas');
    const DEFAULT_CANVAS_SIZE = 1080;
    const offscreenCanvas = new fabric.StaticCanvas(offscreenEl, {
        width: savedState.width || DEFAULT_CANVAS_SIZE,
        height: savedState.height || DEFAULT_CANVAS_SIZE,
        backgroundColor: 'transparent'
    });

    try {
        await offscreenCanvas.loadFromJSON(savedState);
        let artboard = offscreenCanvas.getObjects().find(o => o.isArtboard);
        if (!artboard) {
            let fallbackBg = savedState.background || '#ffffff';
            if (fallbackBg === '#e5e5e5') fallbackBg = '#ffffff';

            artboard = new fabric.Rect({
                width: savedState.width || DEFAULT_CANVAS_SIZE,
                height: savedState.height || DEFAULT_CANVAS_SIZE,
                fill: fallbackBg,
                left: 0,
                top: 0,
                originX: 'left',
                originY: 'top',
                isArtboard: true
            });
            offscreenCanvas.add(artboard);
            offscreenCanvas.sendObjectToBack(artboard);
        }

        offscreenCanvas.sendObjectToBack(artboard);
        offscreenCanvas.renderAll();

        const previewDataUrl = offscreenCanvas.toDataURL({
            format: 'webp',
            multiplier: 1.0,
            quality: 0.9,
            enableRetinaScaling: true
        });

        const response = await fetch(previewDataUrl);
        const blob = await response.blob();
        return new File([blob], 'template_preview.webp', { type: 'image/webp' });
    } finally {
        offscreenCanvas.dispose();
    }
};

/**
 * Finds the artboard object in a fabric canvas.
 */
export const getArtboard = (canvas) => {
    if (!canvas) return null;
    return canvas.getObjects().find(o => o.isArtboard);
};

/**
 * Centers a fabric object on the artboard or canvas.
 */
export const centerObject = (canvas, object) => {
    if (!canvas || !object) return;

    const artboard = getArtboard(canvas);
    const cw = artboard ? artboard.width : canvas.width;
    const ch = artboard ? artboard.height : canvas.height;

    object.set({
        left: cw / 2,
        top: ch / 2,
        originX: 'center',
        originY: 'center'
    });
};
/**
 * Memvalidasi apakah URL gambar bisa dimuat.
 */
const validateUrl = (url) => {
    if (!url || typeof url !== 'string') return Promise.resolve(false);
    if (url.startsWith('data:')) return Promise.resolve(true);
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        setTimeout(() => resolve(false), 5000);
    });
};

/**
 * Membersihkan JSON kanvas dari URL gambar yang rusak.
 */
export const sanitizeImages = async (json) => {
    if (!json || !json.objects) return json;
    
    // Cari semua unik URL gambar
    const imgObjects = json.objects.filter(obj => obj.type === 'image' || obj.type === 'FabricImage');
    const uniqueUrls = [...new Set(imgObjects.map(o => o.src))];
    
    // Validasi secara paralel
    const results = await Promise.all(uniqueUrls.map(async (url) => ({
        url,
        isValid: await validateUrl(url)
    })));
    
    const validMap = new Map(results.map(r => [r.url, r.isValid]));
    
    // Terapkan CORS dan Fallback
    const updatedObjects = json.objects.map(obj => {
        if (obj.type === 'image' || obj.type === 'FabricImage') {
            const isValid = validMap.get(obj.src);
            return {
                ...obj,
                crossOrigin: 'anonymous',
                src: isValid ? obj.src : BROKEN_IMAGE_URL
            };
        }
        return obj;
    });

    return { ...json, objects: updatedObjects };
};
