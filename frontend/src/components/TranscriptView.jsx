export default function TranscriptView({ transcription }) {
  if (!transcription) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Transcript</h3>
        <p className="text-gray-400 text-sm">No transcript available yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-3">Transcript</h3>
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
        {transcription.transcript_text}
      </p>
    </div>
  )
}
