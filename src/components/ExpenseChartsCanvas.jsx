import { useEffect, useMemo, useRef } from 'react'

const COLORS = ['#4f46e5', '#0ea5e9', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899']

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

function getCanvasThemeColors() {
  const isDark = document.documentElement.dataset.theme === 'dark'
  if (isDark) {
    return {
      title: '#f5f4ff',
      text: '#e8f8fc',
      muted: '#d8d3f2',
      axis: 'rgba(196, 181, 253, 0.45)',
    }
  }

  return {
    title: '#111827',
    text: '#374151',
    muted: '#4b5563',
    axis: '#e5e7eb',
  }
}

function normalizeCanvas(canvas, width = 520, height = 300) {
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

function drawEmptyState(ctx, title, width, height) {
  const colors = getCanvasThemeColors()
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = colors.title
  ctx.font = '600 16px Inter, Segoe UI, Arial'
  ctx.fillText(title, 20, 34)
  ctx.fillStyle = colors.muted
  ctx.font = '500 14px Inter, Segoe UI, Arial'
  ctx.fillText('No expense data available', 20, 62)
}

function getCanvasWidth(canvas, compact) {
  const cap = compact ? 880 : 520
  const parentWidth = canvas.parentElement?.clientWidth || cap
  return Math.max(300, Math.min(cap, parentWidth - 8))
}

function ExpenseChartsCanvas({ transactions, compact = false }) {
  const pieRef = useRef(null)
  const barRef = useRef(null)

  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'expense' && Number(t.amount || 0) > 0),
    [transactions],
  )

  const categoryData = useMemo(() => {
    const map = new Map()
    for (const t of expenseTransactions) {
      map.set(t.category, (map.get(t.category) || 0) + Number(t.amount || 0))
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [expenseTransactions])

  const monthData = useMemo(() => {
    const map = new Map()
    for (const t of expenseTransactions) {
      const d = new Date(t.date)
      if (Number.isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      map.set(key, (map.get(key) || 0) + Number(t.amount || 0))
    }
    const entries = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    return entries.slice(-6)
  }, [expenseTransactions])

  useEffect(() => {
    if (!pieRef.current) return
    const colors = getCanvasThemeColors()
    const w = getCanvasWidth(pieRef.current, compact)
    const h = 300
    const ctx = normalizeCanvas(pieRef.current, w, h)
    ctx.clearRect(0, 0, w, h)

    if (categoryData.length === 0) {
      drawEmptyState(ctx, 'Category-wise Expenses (Pie)', w, h)
      return
    }

    const total = categoryData.reduce((s, [, v]) => s + v, 0)
    let start = -Math.PI / 2
    const hasSideLegend = w >= 460
    const cx = hasSideLegend ? 150 : Math.floor(w / 2)
    const cy = hasSideLegend ? 160 : 120
    const r = hasSideLegend ? 92 : 72

    categoryData.forEach(([category, value], idx) => {
      const fraction = value / total
      const end = start + fraction * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = COLORS[idx % COLORS.length]
      ctx.fill()
      start = end

      const legendY = (hasSideLegend ? 28 : 210) + idx * 20
      if (legendY < h - 10) {
        const legendX = hasSideLegend ? 286 : 20
        ctx.fillStyle = COLORS[idx % COLORS.length]
        ctx.fillRect(legendX, legendY - 11, 12, 12)
        ctx.fillStyle = colors.text
        ctx.font = '600 12px Inter, Segoe UI, Arial'
        const shortCategory = category.length > (hasSideLegend ? 12 : 18) ? `${category.slice(0, hasSideLegend ? 12 : 18)}...` : category
        ctx.fillText(`${shortCategory}: ${formatINR(value)}`, legendX + 18, legendY)
      }
    })

    ctx.fillStyle = colors.title
    ctx.font = '700 16px Inter, Segoe UI, Arial'
    ctx.fillText('Category-wise Expenses (Pie)', 18, 28)
  }, [categoryData, compact])

  useEffect(() => {
    if (!barRef.current) return
    const colors = getCanvasThemeColors()
    const width = getCanvasWidth(barRef.current, compact)
    const ctx = normalizeCanvas(barRef.current, width, 300)
    ctx.clearRect(0, 0, width, 300)

    if (monthData.length === 0) {
      drawEmptyState(ctx, 'Monthly Expenses (Bar)', width, 300)
      return
    }

    const maxValue = Math.max(...monthData.map(([, v]) => v), 1)
    const chartX = 36
    const chartY = 40
    const chartW = Math.max(220, width - 56)
    const chartH = 210
    const barGap = 14
    const barWidth = (chartW - barGap * (monthData.length + 1)) / monthData.length

    ctx.fillStyle = colors.title
    ctx.font = '700 16px Inter, Segoe UI, Arial'
    ctx.fillText('Monthly Expenses (Bar)', 18, 28)

    ctx.strokeStyle = colors.axis
    ctx.beginPath()
    ctx.moveTo(chartX, chartY)
    ctx.lineTo(chartX, chartY + chartH)
    ctx.lineTo(chartX + chartW, chartY + chartH)
    ctx.stroke()

    monthData.forEach(([key, value], i) => {
      const h = (value / maxValue) * (chartH - 20)
      const x = chartX + barGap + i * (barWidth + barGap)
      const y = chartY + chartH - h
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fillRect(x, y, barWidth, h)

      ctx.fillStyle = colors.muted
      ctx.font = '600 11px Inter, Segoe UI, Arial'
      const [yy, mm] = key.split('-')
      ctx.fillText(`${mm}/${yy.slice(2)}`, x, chartY + chartH + 14)
    })
  }, [monthData, compact])

  return (
    <div className={`charts-grid ${compact ? 'charts-grid-compact' : ''}`}>
      <canvas ref={pieRef} className="chart-canvas" />
      <canvas ref={barRef} className="chart-canvas" />
    </div>
  )
}

export default ExpenseChartsCanvas

