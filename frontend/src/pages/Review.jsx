import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAttempts, getProgress, getAnalysisStatus, fetchQuestions } from '../api/client'
import AttemptList from '../components/AttemptList'
import TranscriptView from '../components/TranscriptView'
import FeedbackPanel from '../components/FeedbackPanel'
import AnalyticsCard from '../components/AnalyticsCard'
import ProgressChart from '../components/ProgressChart'

export default function Review() {
  const { questionId } = useParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchQuestions(),
      getAttempts(questionId),
      getProgress(questionId),
    ])
      .then(([qs, atts, prog]) => {
        const q = qs.find((q) => q.id === Number(questionId))
        setQuestion(q)
        setAttempts(atts)
        setProgress(prog)
        if (atts.length > 0) {
          setSelectedId(atts[0].attempt.id)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [questionId])

  // Poll for analysis status on the selected attempt if it's pending
  useEffect(() => {
    if (!selectedId) return

    const selected = attempts.find((a) => a.attempt.id === selectedId)
    if (selected?.feedback) return // already complete

    const interval = setInterval(async () => {
      try {
        const status = await getAnalysisStatus(selectedId)
        if (status.status === 'complete') {
          // Refresh attempts
          const atts = await getAttempts(questionId)
          setAttempts(atts)
          const prog = await getProgress(questionId)
          setProgress(prog)
          clearInterval(interval)
        }
      } catch {}
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedId, attempts, questionId])

  const selected = attempts.find((a) => a.attempt.id === selectedId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white text-sm mb-2 transition-colors"
          >
            &larr; Back to questions
          </button>
          <h1 className="text-xl font-bold">{question?.question_text}</h1>
        </div>
        <button
          onClick={() => navigate(`/interview/${questionId}`)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Practice Again
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar: attempt list */}
        <div className="col-span-3">
          <AttemptList
            attempts={attempts}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Main content */}
        <div className="col-span-9 space-y-6">
          {selected ? (
            <>
              {/* Video playback */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Recording</h3>
                <video
                  src={`/recordings/${selected.attempt.video_path}`}
                  controls
                  className="w-full rounded-lg max-h-96"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <TranscriptView transcription={selected.transcription} />
                <AnalyticsCard analytics={selected.analytics} />
              </div>

              <FeedbackPanel feedback={selected.feedback} />

              {!selected.feedback && (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 text-sm text-yellow-300">
                  Analysis is in progress. This page will update automatically when complete.
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-400 text-center py-20">
              Select an attempt to view details.
            </div>
          )}

          <ProgressChart progress={progress} />
        </div>
      </div>
    </div>
  )
}
