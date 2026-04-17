/**
 * Computes the SHA-256 hash of a Blob or File.
 * Uses the browser's native Web Crypto API (fast, no dependencies).
 * @param {Blob|File} blob
 * @returns {Promise<string>} - Lowercase hex string, e.g. "a3f2c1..."
 */
export const computeSHA256 = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
