import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

const IMAGE_CACHE_NAME = 'design-previews';

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
          // Fetch and cache
          const response = await fetch(src);
          if (response.ok) {
            await cache.put(src, response.clone());
            const blob = await response.blob();
            objectUrl = URL.createObjectURL(blob);
            if (isMounted) setImgUrl(objectUrl);
          } else {
            if (isMounted) setImgUrl(src); // Fallback
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

const ProjectsView = ({ designs, loading, error, fetchDesigns, handleCreateNew, handleDeleteDesign, user }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-[var(--accent)]" size={48} />
        <p className="font-bold text-[var(--text-muted)]">Fetching your workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mus-panel p-10 bg-red-50 border-red-200 text-center">
        <p className="text-[var(--danger)] font-bold">{error}</p>
        <button onClick={fetchDesigns} className="mt-4 mus-button-amber px-6 py-2">Try Again</button>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-3">Welcome back, <span className="text-[var(--accent)]">{user?.userName?.split(' ')[0] || 'User'}.</span></h1>
          <p className="text-[var(--text-muted)] font-bold">You have {designs.length} active projects this week.</p>
        </div>
        <button onClick={handleCreateNew} className="mus-button-amber px-10 py-4 font-black flex items-center gap-3 shadow-[var(--shadow-md)] text-lg">
          <Plus size={24} />
          New Design
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {designs.map((design) => (
          <Link key={design.id} to={`/editor/${design.id}`} className="group block">
            <div className="p-3 h-80 flex flex-col justify-between mus-project-card">
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full flex items-center justify-center overflow-hidden relative mus-project-card-image-wrap">
                    {design.previewImageUrl ? (
                      <CachedImage 
                        src={design.previewImageUrl} 
                        alt={design.title} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        decoding="async"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full p-4 flex flex-col gap-2 ${design.previewImageUrl ? 'hidden absolute inset-0' : 'flex'}`}>
                      <div className="w-full h-3/4 bg-white/50 rounded-lg flex items-center justify-center">
                          <span className="text-5xl opacity-20 group-hover:opacity-40 transition-opacity">🖼️</span>
                      </div>
                      <div className="flex gap-2">
                          <div className="h-6 flex-1 bg-white/30 rounded"></div>
                          <div className="h-6 w-12 bg-white/30 rounded"></div>
                      </div>
                    </div>
                </div>
              </div>
              <div className="mt-3 px-2 flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mus-text-primary group-hover:text-[var(--accent)] transition-colors line-clamp-1">{design.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[13px] mus-text-muted">
                    <span className="text-[10px]">📷</span> 
                    <span className="truncate">• {design.updatedAt ? `Diedit ${new Date(design.updatedAt).toLocaleDateString()}` : 'Baru saja'}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteDesign(e, design.id);
                  }}
                  className="p-1.5 transition-colors mus-rounded-md mus-text-primary hover:bg-[var(--accent-light)] flex-shrink-0 mt-0.5"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Link>
        ))}

        {/* Create New Card */}
        <div onClick={handleCreateNew} className="mus-panel p-4 h-80 border-dashed border-[var(--border-light)] flex flex-col items-center justify-center gap-6 hover:border-[var(--border-dark)] bg-transparent hover:bg-white/30 transition-all cursor-pointer group">
          <div className="w-20 h-20 rounded-[2.5rem] border-2 border-dashed border-[var(--border-light)] flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--border-dark)] group-hover:rotate-45 transition-all duration-500">
            <Plus size={40} className="text-[var(--text-muted)] group-hover:text-[var(--border-dark)]" />
          </div>
          <div className="text-center">
            <span className="font-black text-lg text-[var(--text-muted)] group-hover:text-[var(--text-primary)] block">Create New Template</span>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-1 italic">Start with a blank canvas</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsView;
