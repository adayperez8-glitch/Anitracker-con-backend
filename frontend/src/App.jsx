import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AnimeProvider } from './context/AnimeContext'
import { WatchlistProvider } from './context/WatchlistContext'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import Navbar from './components/Navbar/Navbar'
import LoginPage from './pages/LoginPage/LoginPage'
import HomePage from './pages/HomePage/HomePage'
import SearchPage from './pages/SearchPage/SearchPage'
import AnimeDetailPage from './pages/AnimeDetailPage/AnimeDetailPage'
import MyListPage from './pages/MyListPage/MyListPage'
import CalendarPage from './pages/CalendarPage/CalendarPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'

function Layout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/anime/:id" element={<ProtectedRoute><AnimeDetailPage /></ProtectedRoute>} />
        <Route path="/mylist" element={<ProtectedRoute><MyListPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimeProvider>
          <WatchlistProvider>
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<Layout />} />
              </Routes>
            </ErrorBoundary>
          </WatchlistProvider>
        </AnimeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}