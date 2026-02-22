import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'

function Placeholder({ name }) {
  return (
    <div className="flex items-center justify-center h-screen text-gray-400">
      {name} — coming soon
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview/:questionId" element={<Interview />} />
        <Route path="/review/:questionId" element={<Placeholder name="Review" />} />
      </Routes>
    </div>
  )
}
