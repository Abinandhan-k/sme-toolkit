import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import '@/lib/i18n'

import { AuthProvider } from '@/app/providers'
import { ThemeProvider } from '@/app/theme-context'
import { LanguageProvider } from '@/app/language-context'
import { queryClient } from '@/lib/query-client'
import { Toaster } from '@/components/ui/Toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { initializeOfflineSync } from '@/lib/offlineSync'
import { initializeSentry } from '@/lib/sentry'

// Layout
import RootLayout from '@/app/layout'
import AuthLayout from '@/features/auth/layout'

// Auth Pages
import SignInPage from '@/pages/auth/signin'
import SignUpPage from '@/pages/auth/signup'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import ResetPasswordPage from '@/pages/auth/reset-password'

// Protected Pages
import Dashboard from '@/pages/dashboard'
import Customers from '@/pages/customers'
import Invoices from '@/pages/invoices'
import Items from '@/pages/items'
import CRM from '@/pages/crm'
import Analytics from '@/pages/analytics'
import Settings from '@/pages/settings'
import Tasks from '@/pages/tasks'
import Vendors from '@/pages/vendors'
import HR from '@/pages/hr'
import Assessment from '@/pages/assessment'
import AssessmentMultiLang from '@/pages/assessment-multilang'
import Billing from '@/pages/billing'
import Onboarding from '@/pages/onboarding'

// Import ProtectedRoute
import { ProtectedRoute } from '@/app/protected-route'

// Initialize Sentry on app load (if configured)
initializeSentry().catch(console.error)

function AppContent() {
  const { i18n } = useTranslation()

  // Initialize offline sync
  useEffect(() => {
    const cleanup = initializeOfflineSync()
    return cleanup
  }, [])

  return (
    <div dir={i18n.language === 'ta' ? 'rtl' : 'ltr'}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/auth/signin" element={<SignInPage />} />
                <Route path="/auth/signup" element={<SignUpPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Onboarding Route (protected but full-screen) */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <RootLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/items" element={<Items />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/hr" element={<HR />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/assessment-multilang" element={<AssessmentMultiLang />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
