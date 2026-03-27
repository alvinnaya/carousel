import React, { useRef, useState, useEffect } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import { useAuth } from '../../context/AuthContext';
import * as fabric from 'fabric';
import imageService from '../../api/imageService';
import { Loader2, Globe, Lock, MoreVertical, Trash2, Upload } from 'lucide-react';
import { extractObjectKey } from '../../utils/canvasUtils';
import { ConfirmModal, AlertModal } from '../ui/Modal';

const AddImage = () => {
    const { canvas } = useCanvasContext();
    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('user'); // 'user', 'public', or 'admin'
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('Admin');

    // Modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', isDanger: false });

    const showAlert = (title, message, isDanger = false) => {
        setAlertModal({ isOpen: true, title, message, isDanger });
    };

    const showConfirm = (title, message, onConfirm, isDanger = false) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm, isDanger });
    };

    useEffect(() => {
        fetchImages();
    }, [activeTab]);

    const fetchImages = async (tabOverride) => {
        const tab = tabOverride ?? activeTab;
        try {
            setLoading(true);
            const ts = Date.now(); // Cache buster
            let response;
            if (tab === 'user') {
                response = await imageService.getMyImages(ts);
            } else if (tab === 'admin') {
                response = await imageService.getAdminPrivateImages(ts);
            } else {
                response = await imageService.getPublicAssets(ts);
            }

            if (response && response.success && response.data) {
                setImages(response.data);
            } else if (Array.isArray(response)) {
                setImages(response);
            }
        } catch (err) {
            console.error("Failed to fetch images", err);
            const errMsg = err.response?.data?.message || "Gagal mengambil daftar gambar.";
            showAlert('Gagal', errMsg, true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddImage = async (imageUrl) => {
        if (!canvas || !imageUrl) return;

        let finalImageUrl = imageUrl;
        const objectKey = extractObjectKey(imageUrl);

        if (objectKey && (activeTab === 'user' || activeTab === 'admin')) {
            try {
                const res = await imageService.getStableUrl(objectKey);
                if (res?.success && res.data?.url) {
                    finalImageUrl = res.data.url;
                }
            } catch (err) {
                console.warn('Gagal mendapatkan stable URL, menggunakan signed URL sementara', err);
            }
        }

        fabric.FabricImage.fromURL(finalImageUrl, {
            crossOrigin: 'anonymous'
        }).then((img) => {
            img.set({
                imageKey: objectKey,
                crossOrigin: 'anonymous',
                left: (canvas.width || 0) / 2,
                top: (canvas.height || 0) / 2,
                originX: 'center',
                originY: 'center',
                scaleX: 0.5,
                scaleY: 0.5,
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        }).catch(err => {
            console.error('Failed to load image onto canvas:', err);
            showAlert('Gagal Memuat Gambar', 'Tidak dapat memuat gambar ke kanvas. Pastikan pengaturan CORS pada R2 sudah benar.', true);
        });
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic frontend validation (API also validates magic number)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showAlert('Format File Tidak Didukung', 'Hanya file JPG, PNG, dan WebP yang diizinkan.', true);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showAlert('File Terlalu Besar', 'Maksimal ukuran file adalah 5MB.', true);
            return;
        }

        if (fileInputRef.current) fileInputRef.current.value = '';

        try {
            setUploading(true);
            const response = await imageService.uploadImage(file);

            if (response?.success) {
                // Short delay for backend eventual consistency (though Redis is fast)
                await new Promise(res => setTimeout(res, 800));

                // Switch to My Library tab so the user can see the new image
                if (activeTab !== 'user') {
                    setActiveTab('user');
                } else {
                    // Refresh current view
                    await fetchImages('user');
                }
            }
        } catch (err) {
            console.error('Upload failed', err);
            const errMsg = err.response?.data?.message || 'Gagal mengupload gambar. Silahkan coba lagi.';
            showAlert('Upload Gagal', errMsg, true);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent relative">
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(s => ({ ...s, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
                confirmLabel="Ya, lanjutkan"
                cancelLabel="Batal"
            />
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(s => ({ ...s, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                isDanger={alertModal.isDanger}
            />

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleUpload}
            />

            {/* Fixed Header Section */}
            <div className="flex-shrink-0 p-4 space-y-4 z-20 mus-sticky-header">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mus-button-action-sm"
                >
                    {uploading ? (
                        <>
                            <Loader2 size={12} className="animate-spin text-white" />
                            <span>Uploading Assets...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={12} className="text-white" />
                            <span>Upload Image</span>
                        </>
                    )}
                </button>

                <div className="mus-tab-container">
                    <button
                        onClick={() => setActiveTab('user')}
                        className={`mus-tab-btn ${activeTab === 'user' ? 'mus-tab-btn-active' : 'mus-tab-btn-inactive'}`}
                    >
                        Library
                    </button>
                    <button
                        onClick={() => setActiveTab('public')}
                        className={`mus-tab-btn ${activeTab === 'public' ? 'mus-tab-btn-active' : 'mus-tab-btn-inactive'}`}
                    >
                        Stock
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`mus-tab-btn ${activeTab === 'admin' ? 'mus-tab-btn-active' : 'mus-tab-btn-inactive'}`}
                        >
                            Admin
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {(loading || uploading) ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="animate-spin h-6 w-6 mus-text-muted" />
                        <p className="mus-tool-label">Loading Assets...</p>
                    </div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 pb-4">
                        {images.map((img, idx) => (
                            <div
                                key={img.id || img.objectKey || idx}
                                onClick={() => handleAddImage(img.url)}
                                className="aspect-square mus-asset-card group cursor-pointer"
                            >
                                <img
                                    src={img.url}
                                    alt="Asset"
                                    crossOrigin="anonymous"
                                    className="mus-asset-image"
                                    loading="lazy"
                                />

                                {img.isPublic && (
                                    <div className="mus-asset-badge">
                                        <div className="mus-asset-status-indicator bg-green-500" title="Public Asset">
                                            <Globe size={10} />
                                        </div>
                                    </div>
                                )}
                                {!img.isPublic && (activeTab === 'user' || activeTab === 'admin') && (
                                    <div className="mus-asset-badge">
                                        <div className="mus-asset-status-indicator bg-zinc-800" title="Private Asset">
                                            <Lock size={10} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-4 border-dashed mus-border-soft mus-rounded-lg">
                        <p className="mus-text-muted text-[10px]">
                            {activeTab === 'user' ? 'No images uploaded yet.' : 'No public assets available.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddImage;
