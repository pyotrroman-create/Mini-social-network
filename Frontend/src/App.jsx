import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Profile from './pages/Profile'
import PostModal from './components/PostModal'
import ProtectedRoute from './components/ProtectedRoute'
import { FeedProvider } from './context/FeedContext.jsx'
import Explore from './pages/Explore'
import NotFound from './pages/NotFound'
import EditProfile from './pages/EditProfile'

function App() {
  const location = useLocation()
  const backgroundLocation = location.state?.backgroundLocation

  return (
    <FeedProvider>
      <Routes location={backgroundLocation || location}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts/:postId"
          element={
            <ProtectedRoute>
              <PostModal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accounts/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/posts/:postId"
            element={
              <ProtectedRoute>
                <PostModal />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </FeedProvider>
  )
}

export default App