import React, { useState, useEffect } from 'react'
import { CanvasProvider } from './context/CanvasContext.jsx'
import Canvas from './components/canvas/Canvas.jsx'
import SidebarContainer from './components/sidebar/SidebarContainer.jsx'
import InspectorContainer from './components/inspector/InspectorContainer.jsx'
import TopNavigation from './components/navigation/TopNavigation.jsx'
import { useParams } from 'react-router-dom'
import designService from './api/designService'
import pageService from './api/pageService'
import { Loader2 } from 'lucide-react'
import { refreshPagesImageUrls } from './utils/canvasUtils'

function Editor() {
  const { id } = useParams()
  const [design, setDesign] = useState(null)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [designRes, pagesRes] = await Promise.all([
          designService.getById(id),
          pageService.getByDesignId(id)
        ]);

        console.log('Editor Fetch Data:', { designRes, pagesRes });

        if (designRes?.success) {
          setDesign(designRes.data);
        } else if (designRes && !designRes.success && typeof designRes === 'object' && !Array.isArray(designRes)) {
          setError(designRes.message || 'Failed to load design');
        } else if (designRes) {
          // Maybe it returned the object directly
          setDesign(designRes);
        }

        if (pagesRes?.success && Array.isArray(pagesRes.data)) {
          const refreshed = await refreshPagesImageUrls(pagesRes.data);
          setPages(refreshed);
        } else if (Array.isArray(pagesRes)) {
          const refreshed = await refreshPagesImageUrls(pagesRes);
          setPages(refreshed);
        } else if (pagesRes?.data && Array.isArray(pagesRes.data.items)) {
          const refreshed = await refreshPagesImageUrls(pagesRes.data.items);
          setPages(refreshed);
        }
      } catch (err) {
        setError('Failed to load design data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg-main)] gap-4 select-none">
        <Loader2 className="animate-spin text-[var(--accent)]" size={48} />
        <p className="font-bold text-[var(--text-muted)]">Loading canvas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg-main)] gap-4 select-none">
        <p className="text-[var(--danger)] font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="mus-button-amber px-6 py-2">Try Again</button>
      </div>
    )
  }

  return (
    <CanvasProvider initialPages={pages} designInfo={design}>
      <div className="relative w-screen h-screen bg-[var(--bg-main)] overflow-hidden select-none">
        <TopNavigation title={design?.title} />
        <SidebarContainer />
        <InspectorContainer />
        <main className="w-full h-full flex items-center justify-center">
          <Canvas />
        </main>
      </div>
    </CanvasProvider>
  )
}

export default Editor
