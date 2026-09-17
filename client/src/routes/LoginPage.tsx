import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, toFieldErrors } from '../lib/schemas'
import { ApiError } from '../services/apiClient'

const DEMO_EMAIL = 'demo@taskmanager.app'
const DEMO_PASSWORD = 'Demo1234'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (values: { email: string; password: string }) => {
    setFormError(null)

    const parsed = loginSchema.safeParse(values)

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      return
    }

    setErrors({})
    setSubmitting(true)

    try {
      await login(parsed.data.email, parsed.data.password)
      navigate('/tasks', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields ?? {})

        if (!error.fields) {
          setFormError(error.message)
        }
      } else {
        setFormError('Something went wrong. Try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit({ email, password })
  }

  const handleDemo = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    void submit({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see your tasks."
      footer={
        <>
          No account yet?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError ? (
          <p className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
            {formError}
          </p>
        ) : null}

        <Field id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <Field id="password" label="Password" error={errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            invalid={Boolean(errors.password)}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={handleDemo}
          disabled={submitting}
          className="w-full"
        >
          Try the demo account
        </Button>
      </form>
    </AuthLayout>
  )
}
