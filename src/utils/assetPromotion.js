import * as fabric from 'fabric';
import { computeSHA256 } from './cryptoUtils';
import canvasAssetService from '../api/canvasAssetService';

/**
 * [FLOW B] Bulk Asset Promotion
 * Processes a Canvas JSON object, finds all images, and promotes them to the current design's scope.
 * 
 * Steps:
 * 1. Find all image objects in the JSON.
 * 2. Pre-fetch them as Blobs and create Local Blob URLs.
 * 3. Mark them as isTransient: true.
 * 4. Perform parallel Hashing -> Handshake -> Upload.
 * 5. Update the canvas objects (src, assetId, isTransient: false) atomically.
 * 
 * @param {Object} canvasJson - The fabric.js JSON to process
 * @param {string} activeId - The target Design or Template ID
 * @param {boolean} isTemplate - Whether we are promoting to a Template (vs Design)
 */
export const promoteCanvasAssets = async (canvasJson, activeId, isTemplate) => {
    if (!canvasJson?.objects) return canvasJson;

    // 1. Identify all image-like objects
    // Fabric 7 usually uses "image" or "FabricImage"
    const imageObjects = canvasJson.objects.filter(obj => 
        obj.type === 'image' || obj.type === 'FabricImage' || (obj.src && !obj.src.startsWith('data:'))
    );

    if (imageObjects.length === 0) return canvasJson;

    // Process each image
    const promotionPromises = imageObjects.map(async (obj) => {
        const originalSrc = obj.src;
        if (!originalSrc || originalSrc.startsWith('blob:')) return;

        try {
            // Step 2: Pre-fetch Blob
            const blob = await fetch(originalSrc, { mode: 'cors' }).then(r => r.blob());
            const tempBlobUrl = URL.createObjectURL(blob);

            // Step 2b: Mark as transient and use local blob URL immediately
            obj.src = tempBlobUrl;
            obj.isTransient = true;

            // Step 3: Compute SHA-256
            const hash = await computeSHA256(blob);

            // Step 4: Handshake
            const checkFn = isTemplate
                ? canvasAssetService.checkAssetInTemplate
                : canvasAssetService.checkAssetInDesign;
            const checkResult = await checkFn(activeId, hash);

            let assetId, officialSrc;

            if (checkResult?.data) {
                assetId = checkResult.data.assetId;
                officialSrc = checkResult.data.preSignedUrl;
            } else {
                // Step 4b: No match — Upload
                const file = new File([blob], `asset_${Date.now()}`, { type: blob.type });
                const uploadFn = isTemplate
                    ? canvasAssetService.uploadToTemplate
                    : canvasAssetService.uploadToDesign;
                const uploadResult = await uploadFn(activeId, file);
                
                if (!uploadResult?.data) throw new Error('Bulk promotion upload failed');
                
                assetId = uploadResult.data.assetId;
                officialSrc = uploadResult.data.preSignedUrl;
            }

            // Step 5: Finalize state in JSON
            obj.src = officialSrc;
            obj.assetId = assetId;
            delete obj.isTransient; // Remove flag so it persists to DB

            // Clean up
            URL.revokeObjectURL(tempBlobUrl);
        } catch (err) {
            console.error('[promoteCanvasAssets] Failed to promote image:', originalSrc, err);
            // On failure, we keep the original URL but it might break if it's a cross-scope reference
        }
    });

    // Wait for all promotions to finish before returning the "clean" JSON
    await Promise.all(promotionPromises);
    return canvasJson;
};
