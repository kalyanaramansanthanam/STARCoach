import { useState, useEffect } from 'react'
import { fetchQuestions } from '../api/client'
import QuestionCard from '../components/QuestionCard'

export default function Home() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuestions()
      .then(setQuestions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">STAR Coach</h1>
        <p className="text-gray-400 mt-2">
          Practice behavioral interview questions and get AI coaching feedback.
          Select a question to start practicing.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-20">Loading questions...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  )
}
