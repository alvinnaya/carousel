import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Globe, Lock, MoreVertical, Trash2, Edit2, Upload } from 'lucide-react';
import imageService from '../../../api/imageService';
import { ConfirmModal, AlertModal, PromptModal } from '../../../components/ui/Modal';

const AssetsView = ({ user }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('user'); // 'user', 'public', 'admin', 'trash'
    const [activeTrashSubTab, setActiveTrashSubTab] = useState('recycle'); // 'recycle', 'public_purge', 'private_purge'
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
    }, [activeTab, activeTrashSubTab]);

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
            } else if (activeTab === 'trash') {
                if (activeTrashSubTab === 'recycle') {
                    response = await imageService.getTrash(ts);
                } else if (activeTrashSubTab === 'public_purge' && isAdmin) {
                    response = await imageService.getAdminPrivateImages(ts);
                } else if (activeTrashSubTab === 'private_purge') {
                    response = await imageService.getMyImages(ts);
                }
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

    const handleRestore = async (image) => {
        try {
            setLoading(true);
            const res = await imageService.restoreImage(image.objectKey);
            if (res.success || res.message) {
                fetchImages();
            }
        } catch (err) {
            console.error('Restore failed', err);
            const errMsg = err.response?.data?.message || 'Terjadi kesalahan saat mengembalikan gambar.';
            showAlert('Gagal Mengembalikan', errMsg, true);
        } finally {
            setLoading(false);
        }
    };

    const handlePermanentDelete = (image) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Permanen?',
            message: `Apakah Anda yakin ingin menghapus "${image.objectKey.split('/').pop()}" selamanya? File akan dihapus dari SEMUA storage (Privat & Publik). Tindakan ini tidak dapat dibatalkan.`,
            isDanger: true,
            onConfirm: async () => {
                try {
                    const res = await imageService.permanentDeleteImage(image.objectKey);
                    if (res.success || res.message) {
                        fetchImages();
                    }
                } catch (err) {
                    console.error('Permanent delete failed', err);
                    const errMsg = err.response?.data?.message || 'Terjadi kesalahan saat menghapus permanen.';
                    showAlert('Gagal Menghapus', errMsg, true);
                } finally {
                    setConfirmModal(s => ({ ...s, isOpen: false }));
                }
            }
        });
    };

    const handlePurgePublic = (image) => {
        showConfirm(
            'Purge Public Mirror?',
            'Hapus file sisa di bucket publik untuk gambar ini? Karena status sekarang privat, file publik tidak lagi diperlukan.',
            async () => {
                try {
                    setLoading(true);
                    const res = await imageService.purgePublicMirror(image.objectKey);
                    if (res.success || res.message) {
                        fetchImages();
                    }
                } catch (err) {
                    console.error('Purge public failed', err);
                    const errMsg = err.response?.data?.message || 'Gagal menghapus file di bucket publik.';
                    showAlert('Gagal Purge', errMsg, true);
                } finally {
                    setLoading(false);
                }
            },
            true
        );
    };

    const handlePurgePrivate = (image) => {
        showConfirm(
            'Purge Private Mirror?',
            'Hapus file asli di bucket privat? Gunakan ini hanya jika Anda ingin menghemat ruang karena gambar sudah tersedia secara publik.',
            async () => {
                try {
                    setLoading(true);
                    const res = await imageService.purgePrivateMirror(image.objectKey);
                    if (res.success || res.message) {
                        fetchImages();
                    }
                } catch (err) {
                    console.error('Purge private failed', err);
                    const errMsg = err.response?.data?.message || 'Gagal menghapus file di bucket privat.';
                    showAlert('Gagal Purge', errMsg, true);
                } finally {
                    setLoading(false);
                }
            },
            true
        );
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
                    <button
                        onClick={() => setActiveTab('trash')}
                        className={`mus-dashboard-tab px-5 py-2 flex items-center gap-2 ${activeTab === 'trash' ? 'mus-dashboard-tab-active' : ''}`}
                    >
                        <Trash2 size={14} />
                        Trash
                    </button>
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

            {activeTab === 'trash' && (
                <div className="flex bg-zinc-100/50 p-1 rounded-lg w-fit mb-6 border border-zinc-200">
                    <button
                        onClick={() => setActiveTrashSubTab('recycle')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTrashSubTab === 'recycle' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        Recycle Bin
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTrashSubTab('public_purge')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTrashSubTab === 'public_purge' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Public Purge (Admin)
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTrashSubTab('private_purge')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTrashSubTab === 'private_purge' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        Private Purge (Owner)
                    </button>
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
                                : activeTrashSubTab === 'recycle'
                                    ? "Your recycle bin is empty."
                                    : activeTrashSubTab === 'public_purge'
                                        ? "No redundant public mirrors found needing cleanup."
                                        : "No redundant private mirrors found."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {images
                        .filter(img => {
                            if (activeTab === 'trash') {
                                if (activeTrashSubTab === 'public_purge') return img.existsInPublic && !img.isPublic;
                                if (activeTrashSubTab === 'private_purge') return img.existsInPrivate && img.isPublic;
                            }
                            return true;
                        })
                        .map((img, index) => (
                            <AssetCard
                                key={img.id || img.objectKey || index}
                                image={img}
                                isAdmin={isAdmin}
                                isTrash={activeTab === 'trash' && activeTrashSubTab === 'recycle'}
                                isPurgeView={activeTab === 'trash' && (activeTrashSubTab === 'public_purge' || activeTrashSubTab === 'private_purge')}
                                isOwner={activeTab === 'user' || (activeTab === 'trash' && activeTrashSubTab === 'private_purge')}
                                onDelete={() => handleDelete(img)}
                                onRename={() => handleRename(img)}
                                onRestore={() => handleRestore(img)}
                                onPermanentDelete={() => handlePermanentDelete(img)}
                                onPurgePublic={() => handlePurgePublic(img)}
                                onPurgePrivate={() => handlePurgePrivate(img)}
                                onToggleStatus={(activeTab === 'user' || activeTab === 'admin') && isAdmin ? () => handleToggleStatus(img) : null}
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

const AssetCard = ({ 
    image, 
    isAdmin, 
    isTrash, 
    isPurgeView,
    isOwner,
    onDelete, 
    onRename, 
    onRestore, 
    onPermanentDelete, 
    onPurgePublic, 
    onPurgePrivate,
    onToggleStatus, 
    showControls, 
    isMenuOpen, 
    setOpenMenuId 
}) => {
    const menuId = image.id || image.objectKey;
    const isMirrored = image.existsInPublic && image.existsInPrivate;

    return (
        <div className="mus-asset-card group flex flex-col hover:shadow-md">
            <div className="aspect-square bg-zinc-100 relative items-center justify-center flex overflow-hidden">
                <img
                    src={image.url}
                    alt="Asset"
                    loading="lazy"
                    crossOrigin="anonymous"
                    className={`mus-asset-image ${isPurgeView ? 'opacity-75 grayscale-[0.5]' : ''}`}
                />

                {showControls && (
                    <div className="mus-asset-actions">
                        {!isPurgeView && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(isMenuOpen ? null : menuId);
                                }}
                                className="mus-asset-action-btn"
                            >
                                <MoreVertical size={16} />
                            </button>
                        )}

                        {isPurgeView && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isAdmin && image.existsInPublic && !image.isPublic) {
                                        onPurgePublic();
                                    } else if (isOwner && image.existsInPrivate && image.isPublic) {
                                        onPurgePrivate();
                                    }
                                }}
                                className="bg-white/90 backdrop-blur shadow-sm text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white transition-all flex items-center gap-2"
                            >
                                <Trash2 size={12} />
                                Purge Mirror
                            </button>
                        )}

                        {isMenuOpen && (
                            <div className="mus-context-menu absolute right-0 top-10 w-44">
                                {isTrash ? (
                                    <>
                                        <div
                                            className="mus-menu-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(null);
                                                onRestore();
                                            }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Upload size={13} className="rotate-180" />
                                                Restore Image
                                            </span>
                                        </div>
                                        <div className="mus-menu-divider" />
                                        <div
                                            className="mus-menu-item mus-menu-item-danger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(null);
                                                onPermanentDelete();
                                            }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Trash2 size={13} />
                                                Delete Permanently
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {isAdmin && onToggleStatus && (
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

                                        {isAdmin && isMirrored && !image.isPublic && (
                                            <div
                                                className="mus-menu-item mus-text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(null);
                                                    onPurgePublic();
                                                }}
                                            >
                                                <span className="flex items-center gap-2 font-medium">
                                                    <Trash2 size={13} />
                                                    Purge Public Mirror
                                                </span>
                                            </div>
                                        )}

                                        {isOwner && isMirrored && image.isPublic && (
                                            <div
                                                className="mus-menu-item mus-text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(null);
                                                    onPurgePrivate();
                                                }}
                                            >
                                                <span className="flex items-center gap-2 font-medium">
                                                    <Trash2 size={13} />
                                                    Purge Private Mirror
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
                                                Delete to Trash
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="mus-asset-badge flex gap-1">
                    {image.isPublic && (
                        <div className="mus-asset-status-indicator bg-green-500" title="Public Asset">
                            <Globe size={14} />
                        </div>
                    )}
                    {isMirrored && (
                        <div 
                            className={`mus-asset-status-indicator ${image.isPublic ? 'bg-blue-500' : 'bg-amber-500 animate-pulse'}`} 
                            title={image.isPublic ? "Mirrored in Private" : "Redundant Public Mirror (Needs Purge)"}
                        >
                            <Lock size={14} />
                        </div>
                    )}
                </div>
            </div>
            <div className="p-3 mus-border-t-soft mus-bg-main flex items-center justify-between">
                <div className="flex flex-col min-w-0">
                    <p className="text-xs mus-text-muted font-medium truncate" title={image.name || image.objectKey}>
                        {image.name || image.objectKey.split('/').pop()}
                    </p>
                    {isMirrored && (
                        <span className="text-[10px] text-zinc-400 font-normal">Mirrored Storage</span>
                    )}
                </div>
                {!image.isPublic && <Lock size={12} className="mus-text-muted opacity-50" title="Private" />}
            </div>
        </div>
    );
};


export default AssetsView;
