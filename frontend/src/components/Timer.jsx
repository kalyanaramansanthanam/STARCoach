export default function Timer({ secondsLeft, color }) {
  const minutes = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <div className={`font-mono text-2xl font-bold ${color} tabular-nums`}>
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  )
}
