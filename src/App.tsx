import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import LandingPage from './pages/LandingPage'
import AppPage from './pages/AppPage'
import CreatePage from './pages/CreatePage'
import ContestPage from './pages/ContestPage'
import AccountPage from './pages/AccountPage'
import AuthPage from './pages/AuthPage'

import ChatPage from './pages/ChatPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/chat/:echoId" element={<ChatPage />} />
          <Route path="/contest" element={<ContestPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
