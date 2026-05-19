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
import UsersPage from './pages/UsersPage/UsersPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import MyProfilePage from './pages/MyProfilePage/MyProfilePage'
import FriendsPage from './pages/FriendsPage/FriendsPage'
import ChatPage from './pages/ChatPage/ChatPage'
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
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/my-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
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
