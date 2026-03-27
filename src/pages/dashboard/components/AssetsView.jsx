import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Globe, Lock, MoreVertical, Trash2, Edit2, Upload } from 'lucide-react';
import imageService from '../../../api/imageService';
import { ConfirmModal, AlertModal, PromptModal } from '../../../components/ui/Modal';

const AssetsView = ({ user }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('user'); // 'user', 'public', 'admin'
    const [openMenuId, setOpenMenuId] = useState(null);
    const fileInputRef = useRef(null);

    // Modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', isDanger: false });
    const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', message: '', defaultValue: '', onConfirm: null });

    const isAdmin = user?.roles?.includes('Admin');

    const showAlert = (title, message, isDanger = false) => {
        setAlertModal({ isOpen: true, title, message, isDanger });
    };

    const showConfirm = (title, message, onConfirm, isDanger = false) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm, isDanger });
    };

    useEffect(() => {
        fetchImages();
    }, [activeTab]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            setError('');
            let response;
            const ts = Date.now();

            if (activeTab === 'user') {
                response = await imageService.getMyImages(ts);
            } else if (activeTab === 'public') {
                response = await imageService.getPublicAssets(ts);
            } else if (activeTab === 'admin' && isAdmin) {
                response = await imageService.getAdminPrivateImages(ts);
            }

            if (response && response.success && response.data) {
                setImages(response.data);
            } else if (Array.isArray(response)) {
                setImages(response);
            }
        } catch (err) {
            console.error('Failed to fetch images:', err);
            const errMsg = err.response?.data?.message || 'Failed to load images. Please try again.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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
                await new Promise(res => setTimeout(res, 800));
                
                if (activeTab !== 'user') {
                    setActiveTab('user');
                } else {
                    await fetchImages();
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

    const handleToggleStatus = (img) => {
        const isCurrentlyPublic = img.isPublic;
        showConfirm(
            isCurrentlyPublic ? 'Make Image Private?' : 'Make Image Public?',
            isCurrentlyPublic
                ? 'Gambar ini tidak akan lagi dapat diakses secara publik dan akan menggunakan Signed URL.'
                : 'Gambar ini akan dapat diakses oleh siapa saja menggunakan URL publik langsung.',
            async () => {
                try {
                    setLoading(true);
                    const objectKey = img.objectKey;
                    const response = isCurrentlyPublic
                        ? await imageService.makeImagePrivate(objectKey)
                        : await imageService.makeImagePublic(objectKey);

                    if (response.success || response.message) {
                        await fetchImages();
                    }
                } catch (err) {
                    console.error('Failed to toggle image status:', err);
                    const errorMessage = err.response?.data?.message || 'Gagal memperbarui status gambar.';
                    showAlert('Gagal', errorMessage, true);
                } finally {
                    setLoading(false);
                    setOpenMenuId(null);
                }
            },
            false
        );
    };

    const handleDelete = (image) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Gambar?',
            message: `Apakah Anda yakin ingin menghapus "${image.objectKey.split('/').pop()}"? Tindakan ini tidak dapat dibatalkan.`,
            isDanger: true,
            onConfirm: async () => {
                try {
                    const res = await imageService.deleteImage(image.objectKey);
                    if (res.success || res.message) {
                        fetchImages();
                    }
                } catch (err) {
                    console.error('Delete failed', err);
                    const errMsg = err.response?.data?.message || 'Terjadi kesalahan saat menghapus gambar.';
                    showAlert('Gagal Menghapus', errMsg, true);
                } finally {
                    setConfirmModal(s => ({ ...s, isOpen: false }));
                }
            }
        });
    };

    const handleRename = (image) => {
        const currentName = image.name || image.objectKey.split('/').pop();
        setPromptModal({
            isOpen: true,
            title: 'Ubah Nama Gambar',
            message: 'Masukkan nama baru untuk gambar ini:',
            defaultValue: currentName,
            onConfirm: async (newName) => {
                if (!newName || newName === currentName) {
                    setPromptModal(s => ({ ...s, isOpen: false }));
                    return;
                }
                try {
                    const res = await imageService.updateImageName(image.objectKey, newName);
                    if (res.success || res.message) {
                        fetchImages();
                    }
                } catch (err) {
                    console.error('Rename failed', err);
                    const errMsg = err.response?.data?.message || 'Terjadi kesalahan saat mengubah nama gambar.';
                    showAlert('Gagal Mengubah Nama', errMsg, true);
                } finally {
                    setPromptModal(s => ({ ...s, isOpen: false }));
                }
            }
        });
    };

    if (loading && images.length === 0) {
        return (
            <div className="flex-1 flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-zinc-400 h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Modals */}
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

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold mus-text-primary">Asset Management</h2>

                <div className="mus-dashboard-nav flex p-1 gap-1">
                    <button
                        onClick={() => setActiveTab('user')}
                        className={`mus-dashboard-tab px-5 py-2 ${activeTab === 'user' ? 'mus-dashboard-tab-active' : ''}`}
                    >
                        Your Assets
                    </button>
                    <button
                        onClick={() => setActiveTab('public')}
                        className={`mus-dashboard-tab px-5 py-2 ${activeTab === 'public' ? 'mus-dashboard-tab-active' : ''}`}
                    >
                        Public Gallery
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`mus-dashboard-tab px-5 py-2 ${activeTab === 'admin' ? 'mus-dashboard-tab-active' : ''}`}
                        >
                            Admin
                        </button>
                    )}
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mus-button-dashboard-action flex items-center gap-3 px-6 py-3"
                >
                    {uploading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={16} />
                            <span>Upload Asset</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-zinc-400 h-8 w-8" />
                </div>
            ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 border border-zinc-200 border-dashed rounded-xl bg-white/50">
                    <div className="p-4 bg-zinc-100 rounded-full mb-4">
                        <Trash2 className="text-zinc-300" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 mb-1">No images found</h3>
                    <p className="text-sm text-zinc-500 text-center max-w-sm">
                        {activeTab === 'user'
                            ? "You haven't uploaded any images yet."
                            : activeTab === 'public'
                                ? "The public gallery is currently empty."
                                : "No user images found in the system."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {images.map((img, index) => (
                        <AssetCard
                            key={img.id || img.objectKey || index}
                            image={img}
                            onDelete={() => handleDelete(img)}
                            onRename={() => handleRename(img)}
                            onToggleStatus={(activeTab === 'user' || activeTab === 'admin') ? () => handleToggleStatus(img) : null}
                            showControls={activeTab !== 'public' || isAdmin}
                            isMenuOpen={openMenuId === (img.id || img.objectKey)}
                            setOpenMenuId={setOpenMenuId}
                        />
                    ))}
                </div>
            )}

            <PromptModal
                isOpen={promptModal.isOpen}
                onClose={() => setPromptModal(s => ({ ...s, isOpen: false }))}
                onConfirm={promptModal.onConfirm}
                title={promptModal.title}
                message={promptModal.message}
                defaultValue={promptModal.defaultValue}
            />
        </div>
    );
};

const AssetCard = ({ image, onDelete, onRename, onToggleStatus, showControls, isMenuOpen, setOpenMenuId }) => {
    const menuId = image.id || image.objectKey;
    return (
        <div className="mus-asset-card group flex flex-col hover:shadow-md">
            <div className="aspect-square bg-zinc-100 relative items-center justify-center flex overflow-hidden">
                <img
                    src={image.url}
                    alt="Asset"
                    loading="lazy"
                    crossOrigin="anonymous"
                    className="mus-asset-image"
                />

                {showControls && (
                    <div className="mus-asset-actions">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(isMenuOpen ? null : menuId);
                            }}
                            className="mus-asset-action-btn"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {isMenuOpen && (
                            <div className="mus-context-menu absolute right-0 top-10 w-40">
                                {onToggleStatus && (
                                    <div
                                        className="mus-menu-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(null);
                                            onToggleStatus();
                                        }}
                                    >
                                        <span className="flex items-center gap-2">
                                            {image.isPublic ? <Lock size={13} /> : <Globe size={13} />}
                                            {image.isPublic ? 'Make Private' : 'Make Public'}
                                        </span>
                                    </div>
                                )}
                                <div
                                    className="mus-menu-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        onRename();
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        <Edit2 size={13} />
                                        Rename
                                    </span>
                                </div>
                                <div className="mus-menu-divider" />
                                <div
                                    className="mus-menu-item mus-menu-item-danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        onDelete();
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        <Trash2 size={13} />
                                        Delete
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {image.isPublic && (
                    <div className="mus-asset-badge">
                        <div className="mus-asset-status-indicator bg-green-500" title="Public Asset">
                            <Globe size={14} />
                        </div>
                    </div>
                )}
            </div>
            <div className="p-3 mus-border-t-soft mus-bg-main flex items-center justify-between">
                <p className="text-xs mus-text-muted font-medium truncate" title={image.name || image.objectKey}>
                    {image.name || image.objectKey.split('/').pop()}
                </p>
                {!image.isPublic && <Lock size={12} className="mus-text-muted opacity-50" title="Private" />}
            </div>
        </div>
    );
};


export default AssetsView;
