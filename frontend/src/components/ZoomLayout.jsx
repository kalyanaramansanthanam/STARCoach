import CoachAvatar from './CoachAvatar'
import VideoRecorder from './VideoRecorder'
import Timer from './Timer'

export default function ZoomLayout({ stream, secondsLeft, timerColor, questionText, isRecording }) {
  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Question bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <p className="text-gray-200 text-center text-sm leading-relaxed max-w-3xl mx-auto">
          {questionText}
        </p>
      </div>

      {/* Video tiles */}
      <div className="flex-1 flex gap-3 p-4">
        {/* Coach tile (60%) */}
        <div className="w-[60%] relative">
          <CoachAvatar />
          {isRecording && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-300">REC</span>
            </div>
          )}
        </div>

        {/* User tile (40%) */}
        <div className="w-[40%] relative">
          <VideoRecorder stream={stream} />
          {/* Timer overlay */}
          <div className="absolute top-3 right-3">
            <Timer secondsLeft={secondsLeft} color={timerColor} />
          </div>
        </div>
      </div>
    </div>
  )
}
