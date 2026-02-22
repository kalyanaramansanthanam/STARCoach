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

function parseStarScores(dataPoints) {
  const hasAny = dataPoints.some((p) => {
    if (!p.star_scores) return false
    try {
      const s = JSON.parse(p.star_scores)
      return s.situation != null || s.task != null || s.action != null || s.result != null
    } catch {
      return false
    }
  })
  if (!hasAny) return null

  return dataPoints.map((p) => {
    try {
      return JSON.parse(p.star_scores)
    } catch {
      return {}
    }
  })
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

  const starScores = parseStarScores(progress.data_points)

  const starData = starScores
    ? {
        labels,
        datasets: [
          {
            label: 'Situation',
            data: starScores.map((s) => s.situation ?? null),
            borderColor: 'rgb(251, 191, 36)',
            backgroundColor: 'rgba(251, 191, 36, 0.5)',
            tension: 0.3,
          },
          {
            label: 'Task',
            data: starScores.map((s) => s.task ?? null),
            borderColor: 'rgb(244, 114, 182)',
            backgroundColor: 'rgba(244, 114, 182, 0.5)',
            tension: 0.3,
          },
          {
            label: 'Action',
            data: starScores.map((s) => s.action ?? null),
            borderColor: 'rgb(56, 189, 248)',
            backgroundColor: 'rgba(56, 189, 248, 0.5)',
            tension: 0.3,
          },
          {
            label: 'Result',
            data: starScores.map((s) => s.result ?? null),
            borderColor: 'rgb(163, 230, 53)',
            backgroundColor: 'rgba(163, 230, 53, 0.5)',
            tension: 0.3,
          },
        ],
      }
    : null

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Progress</h3>
        <span className={`text-sm font-medium ${TREND_COLORS[progress.trend]}`}>
          {TREND_LABELS[progress.trend]}
        </span>
      </div>
      <Line data={data} options={options} />

      {starData && (
        <div className="pt-6 border-t border-gray-700 mt-6">
          <h3 className="text-lg font-semibold mb-4">STAR Components Progress</h3>
          <Line data={starData} options={options} />
        </div>
      )}
    </div>
  )
}
