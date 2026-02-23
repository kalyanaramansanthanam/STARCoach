import { useState, useEffect } from 'react'
import { fetchQuestions, fetchDashboard } from '../api/client'
import QuestionCard from '../components/QuestionCard'
import Dashboard from '../components/Dashboard'

export default function Home() {
  const [questions, setQuestions] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchQuestions(), fetchDashboard()])
      .then(([q, d]) => {
        setQuestions(q)
        setDashboardData(d)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">STAR Coach</h1>
        <p className="text-gray-400 mt-2">
          Practice behavioral interview questions and get AI coaching feedback.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-20">Loading...</div>
      ) : (
        <>
          {dashboardData && <Dashboard data={dashboardData} />}

          <h2 className="text-xl font-semibold mb-4 text-gray-200">Practice Questions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
