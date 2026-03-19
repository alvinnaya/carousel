import { CanvasProvider } from './src/context/CanvasContext.jsx'
import Canvas from './src/components/canvas/Canvas.jsx'
import SidebarContainer from './src/components/sidebar/SidebarContainer'
import InspectorContainer from './src/components/inspector/InspectorContainer'
import TopNavigation from './src/components/navigation/TopNavigation'

function Editor() {
  return (
    <CanvasProvider>
      <div className="relative w-screen h-screen bg-[#f5f5f0] overflow-hidden select-none">
        <TopNavigation />
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
