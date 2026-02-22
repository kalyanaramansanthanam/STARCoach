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
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

const TREND_COLORS = {
  improving: 'text-green-400',
  declining: 'text-red-400',
  steady: 'text-yellow-400',
}

const TREND_LABELS = {
  improving: 'Improving',
  declining: 'Declining',
  steady: 'Steady',
}

export default function ProgressChart({ progress }) {
  if (!progress || progress.data_points.length < 2) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Progress</h3>
        <p className="text-gray-400 text-sm">
          Record at least 2 attempts to see progress trends.
        </p>
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
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Confidence',
        data: progress.data_points.map((p) => p.confidence_score),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Structure',
        data: progress.data_points.map((p) => p.structure_score),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
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
        ticks: {
          stepSize: 1,
          color: '#9ca3af',
        },
        grid: { color: 'rgba(75, 85, 99, 0.3)' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(75, 85, 99, 0.3)' },
      },
    },
    plugins: {
      legend: {
        labels: { color: '#d1d5db' },
      },
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
