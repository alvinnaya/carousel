import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { CanvasProvider } from './context/CanvasContext.jsx'
import Canvas from './canvas/Canvas.jsx'


function App() {


  return (
    <>
      <CanvasProvider>

        <Canvas />
      </CanvasProvider>
    </>
  )
}

export default App
