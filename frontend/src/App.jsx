
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import Home from './pages/Home'
import Diary from './pages/Diary'

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', paddingBottom: '110px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/scanner" element={<h1>Scanner</h1>} />
          <Route path="/coach" element={<h1>AI Coach</h1>} />
          <Route path="/profile" element={<h1>Profile</h1>} />
        </Routes>
      </div>

      <BottomNav />
    </BrowserRouter>
  )
}

export default App
