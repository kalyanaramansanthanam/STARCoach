import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const TREND_LABELS = {
  improving: 'Improving',
  steady: 'Steady',
  declining: 'Needs work',
}
const TREND_COLORS = {
  improving: 'text-green-400',
  steady: 'text-yellow-400',
  declining: 'text-red-400',
}

export default function ProgressChart({ progress }) {
  if (!progress || progress.data_points.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Progress</h3>
        <p className="text-gray-400 text-sm">No progress data yet. Complete more attempts to see trends.</p>
      </div>
    )
  }

  const labels = progress.data_points.map((p) => `#${p.attempt_number}`)

  const data = {
    labels,
    datasets: [
      {
        label: 'Clarity',
        data: progress.data_points.map((p) => p.clarity_score),
        borderColor: '#60a5fa',
        backgroundColor: '#60a5fa',
        tension: 0.3,
      },
      {
        label: 'Confidence',
        data: progress.data_points.map((p) => p.confidence_score),
        borderColor: '#34d399',
        backgroundColor: '#34d399',
        tension: 0.3,
      },
      {
        label: 'Structure',
        data: progress.data_points.map((p) => p.structure_score),
        borderColor: '#a78bfa',
        backgroundColor: '#a78bfa',
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, color: '#9ca3af' },
        grid: { color: '#374151' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
    },
    plugins: {
      legend: { labels: { color: '#d1d5db' } },
    },
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Progress</h3>
        <span className={`text-sm font-medium ${TREND_COLORS[progress.trend]}`}>
          {TREND_LABELS[progress.trend]}
        </span>
      </div>
      <Line data={data} options={options} />
    </div>
  )
}
