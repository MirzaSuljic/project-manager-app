import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { registerSchema, toFieldErrors } from '../lib/schemas'
import { ApiError } from '../services/apiClient'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsed = registerSchema.safeParse({ name, email, password })

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      return
    }

    setErrors({})
    setSubmitting(true)

    try {
      await register(parsed.data.name, parsed.data.email, parsed.data.password)
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

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organising your work in a minute."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign in
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

        <Field id="name" label="Name" error={errors.name}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            value={name}
            invalid={Boolean(errors.name)}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ada Lovelace"
          />
        </Field>

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
            autoComplete="new-password"
            value={password}
            invalid={Boolean(errors.password)}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
        </Field>

        <p className="text-xs text-ink-muted">
          Use at least 8 characters with one letter and one number.
        </p>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
