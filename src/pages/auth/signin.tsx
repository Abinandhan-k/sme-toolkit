import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Chrome } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [useOTP, setUseOTP] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const { signIn, signInWithOTP, verifyOTP, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn({ email, password })
      toast.success(t('common.success'))
      setTimeout(() => navigate('/'), 1000)
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithOTP(email)
      setOtpSent(true)
      toast.success('OTP sent to your email')
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await verifyOTP(email, otpCode)
      toast.success(t('common.success'))
      setTimeout(() => navigate('/'), 1000)
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
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
          <CardDescription>{t('auth.signIn')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full mb-4 flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2.5 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Chrome size={18} />
                Sign in with Google
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/5 text-white/60">Or continue with</span>
                </div>
              </div>

              <form onSubmit={useOTP ? handleOTPRequest : handlePasswordSignIn} className="space-y-4">
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

                {!useOTP && (
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
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('common.loading') : useOTP ? t('auth.signInWithOTP') : t('auth.signIn')}
                </Button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUseOTP(!useOTP)
                      setPassword('')
                    }}
                    className="flex-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {useOTP ? 'Use password instead' : t('auth.signInWithOTP')}
                  </button>
                  <Link to="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot?
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <form onSubmit={handleOTPVerify} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('auth.enterOTP')}</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.verifyOTP')}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false)
                  setOtpCode('')
                }}
                className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t('auth.resendOTP')}
              </button>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-white/70">
            {t('auth.noAccount')}{' '}
            <Link to="/auth/signup" className="text-blue-400 hover:text-blue-300">
              {t('auth.signUp')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
