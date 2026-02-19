import { CanvasProvider } from './context/CanvasContext.jsx'
import Canvas from './components/canvas/Canvas.jsx'
import SidebarContainer from './components/sidebar/SidebarContainer'
import InspectorContainer from './components/inspector/InspectorContainer'

function App() {
  return (
    <CanvasProvider>
      <div className="relative w-screen h-screen bg-[#f5f5f0] overflow-hidden select-none">
        <SidebarContainer />
        <InspectorContainer />
        <main className="w-full h-full flex items-center justify-center">
          <Canvas />
        </main>
      </div>
    </CanvasProvider>
  )
}

export default App
