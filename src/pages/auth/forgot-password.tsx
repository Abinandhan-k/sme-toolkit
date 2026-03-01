import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { resetPassword } = useAuth()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl">Reset Password</CardTitle>
          <CardDescription>
            {sent ? 'Check your email for reset link' : 'Enter your email to receive a password reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('auth.email')}</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : 'Send Reset Link'}
              </Button>

              <Link
                to="/auth/signin"
                className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                <p className="text-green-400">Password reset link sent!</p>
                <p className="text-sm text-white/60 mt-2">Check your email and follow the link to reset your password.</p>
              </div>

              <Link
                to="/auth/signin"
                className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
