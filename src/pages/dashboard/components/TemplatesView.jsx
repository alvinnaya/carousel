import React from 'react';
import { Link } from 'react-router-dom';
import ContextMenu from '../../../components/shared/ContextMenu';

import { Globe, Lock, MoreVertical, Trash2, Loader2 } from 'lucide-react';

const IMAGE_CACHE_NAME = 'design-previews';

const LoaderIcon = ({ size = 14, className = "" }) => (
    <Loader2 size={size} className={`animate-spin ${className}`} />
);

const CachedImage = ({ src, alt, className, ...props }) => {
  const [imgUrl, setImgUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const loadImage = async () => {
      if (!src || !('caches' in window)) {
        setImgUrl(src);
        setLoading(false);
        return;
      }

      try {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const cachedResponse = await cache.match(src);

        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          objectUrl = URL.createObjectURL(blob);
          if (isMounted) setImgUrl(objectUrl);
        } else {
          const response = await fetch(src);
          if (response.ok) {
            await cache.put(src, response.clone());
            const blob = await response.blob();
            objectUrl = URL.createObjectURL(blob);
            if (isMounted) setImgUrl(objectUrl);
          } else {
            if (isMounted) setImgUrl(src);
          }
        }
      } catch (err) {
        console.error('CachedImage: Failed to load from cache', err);
        if (isMounted) setImgUrl(src);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (loading) {
    return <div className={`animate-pulse bg-[var(--bg-main)] ${className}`} />;
  }

  return (
    <img
      src={imgUrl}
      alt={alt}
      className={className}
      {...props}
    />
  );
};

import templateService from '../../../api/templateService';
import TemplatePreviewModal from './TemplatePreviewModal';

const TemplatesView = ({ 
  templates, 
  loading, 
  error, 
  fetchTemplates, 
  handleDeleteTemplate, 
  isAdmin, 
  handleToggleVisibility,
  showConfirm
}) => {
  const [activeTab, setActiveTab] = React.useState('user'); // 'user', 'public', 'admin', 'trash'
  const [menuState, setMenuState] = React.useState({ x: 0, y: 0, isOpen: false, templateId: null, isPublic: false });
  const [trashTemplates, setTrashTemplates] = React.useState([]);
  const [loadingTrash, setLoadingTrash] = React.useState(false);
  const [previewState, setPreviewState] = React.useState({ isOpen: false, templateId: null });

  // Fetch trash templates when the tab is switched to 'trash'
  React.useEffect(() => {
    if (activeTab === 'trash') {
      fetchTrash();
    }
  }, [activeTab]);

  const fetchTrash = async () => {
    try {
      setLoadingTrash(true);
      const response = await templateService.listTrash(1, 50);
      if (response.success && response.data?.items) {
        setTrashTemplates(response.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch trash templates:', err);
    } finally {
      setLoadingTrash(false);
    }
  };

  const handleContextMenu = (e, template) => {
    e.preventDefault();
    setMenuState({
      x: e.clientX,
      y: e.clientY,
      isOpen: true,
      templateId: template.id,
      isPublic: template.isPublic
    });
  };

  const handleMoreClick = (e, template) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuState({
      x: rect.left,
      y: rect.bottom + 5,
      isOpen: true,
      templateId: template.id,
      isPublic: template.isPublic
    });
  };

  const closeMenu = () => setMenuState(prev => ({ ...prev, isOpen: false }));

  // Filtering logic
  const filteredTemplates = activeTab === 'trash' 
    ? trashTemplates 
    : templates.filter(t => {
        if (activeTab === 'user') return !t.isPublic;
        if (activeTab === 'public') return t.isPublic;
        if (activeTab === 'admin' && isAdmin) return true;
        return true;
      });

  const isLoading = loading || (activeTab === 'trash' && loadingTrash);

  if (isLoading && filteredTemplates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoaderIcon size={48} className="text-[var(--accent)]" />
        <p className="font-bold text-[var(--text-muted)]">Loading templates...</p>
      </div>
    );
  }

  if (error && activeTab !== 'trash') {
    return (
      <div className="mus-panel p-10 bg-red-50 border-red-200 text-center">
        <p className="text-[var(--danger)] font-bold">{error}</p>
        <button onClick={fetchTemplates} className="mt-4 mus-button-amber px-6 py-2">Try Again</button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold mus-text-primary">Template Management</h2>

        <div className="mus-dashboard-nav flex p-1 gap-1">
          <button
            onClick={() => setActiveTab('user')}
            className={`mus-dashboard-tab px-5 py-2 ${activeTab === 'user' ? 'mus-dashboard-tab-active' : ''}`}
          >
            Your Templates
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
            className={`mus-dashboard-tab px-5 py-2 ${activeTab === 'trash' ? 'mus-dashboard-tab-active' : ''}`}
          >
            Trash
          </button>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-zinc-200 border-dashed rounded-xl bg-white/50">
          <div className="p-4 bg-zinc-100 rounded-full mb-4">
            <PaletteIcon className="text-zinc-300" size={32} />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-1">No templates found</h3>
          <p className="text-sm text-zinc-500 text-center max-w-sm">
            {activeTab === 'user'
              ? "You haven't saved any templates yet."
              : activeTab === 'public'
                ? "The public gallery is currently empty."
                : activeTab === 'trash'
                  ? "Recycle bin is empty."
                  : "No items here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              inTrash={activeTab === 'trash'}
              onClick={() => {
                if (activeTab !== 'trash') {
                  setPreviewState({ isOpen: true, templateId: template.id });
                }
              }}
              onMoreClick={(e) => handleMoreClick(e, template)}
              onContextMenu={(e) => handleContextMenu(e, template)}
            />
          ))}
        </div>
      )}

      <ContextMenu 
        isOpen={menuState.isOpen} 
        x={menuState.x} 
        y={menuState.y} 
        onClose={closeMenu}
      >
        <div className="py-1">
            {activeTab === 'trash' ? (
                <>
                    <div 
                        className="mus-menu-item"
                        onClick={async (e) => {
                            e.stopPropagation();
                            closeMenu();
                            try {
                                const response = await templateService.restoreTemplate(menuState.templateId);
                                if (response.success) {
                                    setTrashTemplates(prev => prev.filter(t => t.id !== menuState.templateId));
                                    // Refresh the main templates list in Dashboard
                                    if (fetchTemplates) fetchTemplates();
                                }
                            } catch (err) {
                                console.error('Failed to restore:', err);
                            }
                        }}
                    >
                        <span className="flex items-center gap-2">
                            <MoreVertical size={13} className="rotate-180" />
                            Restore Template
                        </span>
                    </div>
                    <div className="mus-menu-divider" />
                    <div 
                        className="mus-menu-item mus-menu-item-danger"
                        onClick={async (e) => {
                            e.stopPropagation();
                            closeMenu();
                            // Use custom showConfirm instead of window.confirm
                            showConfirm(
                                'Hapus Permanen?',
                                'Template ini akan dihapus selamanya dari database dan penyimpanan. Tindakan ini tidak dapat dibatalkan.',
                                async () => {
                                    try {
                                        const response = await templateService.permanentDeleteTemplate(menuState.templateId);
                                        if (response.success) {
                                            setTrashTemplates(prev => prev.filter(t => t.id !== menuState.templateId));
                                        }
                                    } catch (err) {
                                        console.error('Failed to permanent delete:', err);
                                    }
                                },
                                true
                            );
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
                    {isAdmin && (
                        <>
                            <div 
                                className="mus-menu-item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeMenu();
                                    handleToggleVisibility(menuState.templateId, !menuState.isPublic);
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    {menuState.isPublic ? <Lock size={13} /> : <Globe size={13} />}
                                    {menuState.isPublic ? 'Make Private' : 'Make Public'}
                                </span>
                            </div>
                            <div className="mus-menu-divider" />
                        </>
                    )}
                    <div 
                        className="mus-menu-item mus-menu-item-danger"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeMenu();
                            handleDeleteTemplate({ preventDefault: () => {}, stopPropagation: () => {} }, menuState.templateId);
                        }}
                    >
                        <span className="flex items-center gap-2">
                            <Trash2 size={13} />
                            Move to Trash
                        </span>
                    </div>
                </>
            )}
        </div>
      </ContextMenu>

      <TemplatePreviewModal 
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState({ isOpen: false, templateId: null })}
        templateId={previewState.templateId}
      />
    </div>
  );
};

const TemplateCard = ({ template, onClick, onMoreClick, onContextMenu, inTrash }) => {
  const CardContent = (
    <div className="aspect-[4/5] w-full h-full relative items-center justify-center flex">
      {template.previewUrl ? (
        <CachedImage
          src={template.previewUrl}
          alt={template.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          decoding="async"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full mus-template-placeholder">
          <PaletteIcon size={48} strokeWidth={1} />
        </div>
      )}

      {/* Title overlay on hover so users still know what it is called */}
      <div className="absolute bottom-0 left-0 right-0 p-3 mus-template-title-overlay opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="truncate mus-template-title-text">{template.name}</p>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             onMoreClick(e);
          }}
          className="p-1.5 flex items-center justify-center mus-template-action-btn"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {!inTrash && (
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {template.isPublic ? (
            <div className="p-1.5 flex items-center justify-center mus-template-badge-public" title="Public Template">
              <Globe size={14} />
            </div>
          ) : (
            <div className="p-1.5 flex items-center justify-center mus-template-badge-private" title="Private Template">
              <Lock size={14} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (inTrash) {
    return (
      <div 
        className="mus-template-card group flex flex-col cursor-default"
        onContextMenu={onContextMenu}
      >
        {CardContent}
      </div>
    );
  }

  return (
    <div
      onClick={inTrash ? undefined : onClick}
      className={`mus-template-card group flex flex-col ${inTrash ? 'cursor-default' : 'mus-template-card-interactive'}`}
      onContextMenu={onContextMenu}
    >
      {CardContent}
    </div>
  );
};

const PaletteIcon = ({ size = 16, className = "", strokeWidth = 2 }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.688-1.688h1.938c3.105 0 5.625-2.52 5.625-5.625 0-4.62-4.62-8.75-10.125-8.75z"></path>
    </svg>
);


export default TemplatesView;
