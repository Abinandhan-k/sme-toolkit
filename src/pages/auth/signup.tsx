import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import RoleSelector from '@/components/RoleSelector'
import type { UserRole } from '@/types/auth'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('storekeeper')
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp({ email, password, full_name: fullName, role })
      toast.success('Account created! Please check your email to verify.')
      setTimeout(() => navigate('/auth/signin'), 2000)
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
          <CardTitle className="text-3xl">{t('auth.title')}</CardTitle>
          <CardDescription>{t('auth.signUp')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">{t('auth.fullName')}</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

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

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">{t('auth.password')}</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <RoleSelector value={role} onChange={setRole} disabled={loading} />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('auth.signUp')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-white/70">
            {t('auth.haveAccount')}{' '}
            <Link to="/auth/signin" className="text-blue-400 hover:text-blue-300">
              {t('auth.signIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
