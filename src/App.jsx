import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Editor from './editor.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'
import PrivateRoute from './PrivateRoute.jsx'
import PublicRoute from './PublicRoute.jsx'
import { DashboardProjects, DashboardTemplates, DashboardAssets, DashboardUsers, DashboardElements } from './pages/dashboard/components/DashboardSubRoutes.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
            <Route index element={<Navigate to="design" replace />} />
            <Route path="design" element={<DashboardProjects />} />
            <Route path="template" element={<DashboardTemplates />} />
            <Route path="asset" element={<DashboardAssets />} />
            <Route path="element" element={<DashboardElements />} />
            <Route path="user" element={<DashboardUsers />} />
          </Route>
          <Route path="/editor/:id" element={<PrivateRoute><Editor /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
