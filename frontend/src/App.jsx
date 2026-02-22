import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Review from './pages/Review'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview/:questionId" element={<Interview />} />
        <Route path="/review/:questionId" element={<Review />} />
      </Routes>
    </div>
  )
}
