import { useState } from 'react'

type Status = 'todo' | 'in-progress' | 'done'

interface Task {
  id: number
  title: string
  status: Status
}

const COLUMNS: { status: Status; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]

const statusStyles: Record<Status, string> = {
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Set up project', status: 'done' },
    { id: 2, title: 'Design task board', status: 'in-progress' },
    { id: 3, title: 'Add authentication', status: 'todo' },
  ])
  const [title, setTitle] = useState('')

  const addTask = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title: trimmed, status: 'todo' },
    ])
    setTitle('')
  }

  const advance = (id: number) => {
    const order: Status[] = ['todo', 'in-progress', 'done']
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: order[Math.min(order.indexOf(t.status) + 1, 2)] }
          : t,
      ),
    )
  }

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold">Project Manager</h1>
          <span className="text-sm text-slate-500">{tasks.length} tasks</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="New task…"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="button"
            onClick={addTask}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <section key={col.status}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {col.label}
              </h2>
              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status === col.status)
                  .map((task) => (
                    <article
                      key={task.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <p className="mb-3 text-sm font-medium">{task.title}</p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}
                        >
                          {col.label}
                        </span>
                        {task.status !== 'done' && (
                          <button
                            type="button"
                            onClick={() => advance(task.id)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-900"
                          >
                            Move →
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
