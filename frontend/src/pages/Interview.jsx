import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchQuestions, uploadRecording, triggerAnalysis } from '../api/client'
import useMediaRecorder from '../hooks/useMediaRecorder'
import useTimer from '../hooks/useTimer'
import ZoomLayout from '../components/ZoomLayout'

const TIMER_OPTIONS = [
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
]

export default function Interview() {
  const { questionId } = useParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(null)
  const [timerSetting, setTimerSetting] = useState(120)
  const [phase, setPhase] = useState('setup') // setup | recording | uploading | done
  const [error, setError] = useState(null)
  const startTimeRef = useRef(null)

  const { isRecording, videoBlob, stream, startCamera, stopCamera, startRecording, stopRecording } =
    useMediaRecorder()

  const handleExpire = useCallback(() => {
    stopRecording()
  }, [stopRecording])

  const { secondsLeft, isRunning, start: startTimer, stop: stopTimer, reset: resetTimer, color: timerColor } =
    useTimer(timerSetting, handleExpire)

  useEffect(() => {
    fetchQuestions().then((qs) => {
      const q = qs.find((q) => q.id === Number(questionId))
      setQuestion(q || null)
    })
  }, [questionId])

  useEffect(() => {
    startCamera().catch((err) => setError('Camera access denied. Please allow camera and microphone access.'))
    return () => stopCamera()
  }, [])

  const handleStart = () => {
    resetTimer(timerSetting)
    startRecording()
    startTimer()
    startTimeRef.current = Date.now()
    setPhase('recording')
  }

  const handleStop = () => {
    stopTimer()
    stopRecording()
  }

  // Upload when videoBlob is ready after recording
  useEffect(() => {
    if (videoBlob && phase === 'recording') {
      setPhase('uploading')
      const durationSeconds = (Date.now() - startTimeRef.current) / 1000

      const formData = new FormData()
      formData.append('video', videoBlob, 'recording.webm')
      formData.append('question_id', questionId)
      formData.append('timer_setting', timerSetting)
      formData.append('duration_seconds', durationSeconds.toFixed(1))

      uploadRecording(formData)
        .then((res) => {
          return triggerAnalysis(res.attempt_id).then(() => res)
        })
        .then((res) => {
          setPhase('done')
          stopCamera()
          navigate(`/review/${questionId}`)
        })
        .catch((err) => {
          setError('Upload failed. Please try again.')
          setPhase('setup')
        })
    }
  }, [videoBlob])

  if (!question) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading question...
      </div>
    )
  }

  return (
    <div className="relative h-screen">
      <ZoomLayout
        stream={stream}
        secondsLeft={secondsLeft}
        timerColor={timerColor}
        questionText={question.question_text}
        isRecording={isRecording}
      />

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 border-t border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Back
          </button>

          <div className="flex items-center gap-4">
            {phase === 'setup' && (
              <>
                <div className="flex gap-2">
                  {TIMER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setTimerSetting(opt.value)
                        resetTimer(opt.value)
                      }}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        timerSetting === opt.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleStart}
                  disabled={!stream}
                  className="bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
                >
                  Start Recording
                </button>
              </>
            )}

            {phase === 'recording' && (
              <button
                onClick={handleStop}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
              >
                <span className="w-3 h-3 bg-white rounded-sm" />
                Stop Recording
              </button>
            )}

            {phase === 'uploading' && (
              <div className="text-gray-300 text-sm">Uploading & analyzing...</div>
            )}
          </div>

          <div className="w-12" /> {/* spacer for centering */}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}
