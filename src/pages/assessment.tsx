import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

type Question = {
  id: string
  step: number
  question: string
  category: 'sales' | 'invoicing' | 'finance' | 'hr'
  options: Array<{ label: string; points: number }>
}

const QUIZ_DATA: Question[] = [
  // Step 1: Sales (Q1-4)
  { id: 's1', step: 1, category: 'sales', question: 'How many customers do you currently have?', options: [{ label: '<50', points: 1 }, { label: '50-500', points: 2 }, { label: '500+', points: 3 }] },
  { id: 's2', step: 1, category: 'sales', question: 'What is your average deal cycle?', options: [{ label: '<7 days', points: 3 }, { label: '7-30 days', points: 2 }, { label: '30+ days', points: 1 }] },
  { id: 's3', step: 1, category: 'sales', question: 'Do you have a sales pipeline?', options: [{ label: 'Yes, well-organized', points: 3 }, { label: 'Basic tracking', points: 2 }, { label: 'Not yet', points: 1 }] },
  { id: 's4', step: 1, category: 'sales', question: 'How many active sales reps?', options: [{ label: '0-2', points: 1 }, { label: '3-10', points: 2 }, { label: '10+', points: 3 }] },

  // Step 2: Invoicing (Q5-8)
  { id: 'i1', step: 2, category: 'invoicing', question: 'How do you currently invoice?', options: [{ label: 'Manual/spreadsheet', points: 1 }, { label: 'Email templates', points: 2 }, { label: 'Automated system', points: 3 }] },
  { id: 'i2', step: 2, category: 'invoicing', question: 'Average invoices per month?', options: [{ label: '<10', points: 1 }, { label: '10-100', points: 2 }, { label: '100+', points: 3 }] },
  { id: 'i3', step: 2, category: 'invoicing', question: 'Payment terms used?', options: [{ label: 'Immediate/Cash', points: 1 }, { label: '15-30 days', points: 2 }, { label: 'Variable/Negotiated', points: 3 }] },
  { id: 'i4', step: 2, category: 'invoicing', question: 'Track payment status?', options: [{ label: 'Not really', points: 1 }, { label: 'Manual notes', points: 2 }, { label: 'Automated tracking', points: 3 }] },

  // Step 3: Finance (Q9-12)
  { id: 'f1', step: 3, category: 'finance', question: 'What is your monthly revenue?', options: [{ label: '<₹1L', points: 1 }, { label: '₹1L-₹10L', points: 2 }, { label: '₹10L+', points: 3 }] },
  { id: 'f2', step: 3, category: 'finance', question: 'Do you prepare regular P&L?', options: [{ label: 'Annual only', points: 1 }, { label: 'Quarterly', points: 2 }, { label: 'Monthly', points: 3 }] },
  { id: 'f3', step: 3, category: 'finance', question: 'Expense tracking method?', options: [{ label: 'Basic spreadsheet', points: 1 }, { label: 'Accounting software', points: 2 }, { label: 'Real-time automated', points: 3 }] },
  { id: 'f4', step: 3, category: 'finance', question: 'Tax compliance prepared?', options: [{ label: 'Manual/ad-hoc', points: 1 }, { label: 'Partially automated', points: 2 }, { label: 'Fully automated', points: 3 }] },

  // Step 4: HR (Q13-16)
  { id: 'h1', step: 4, category: 'hr', question: 'Team size?', options: [{ label: '<5', points: 1 }, { label: '5-50', points: 2 }, { label: '50+', points: 3 }] },
  { id: 'h2', step: 4, category: 'hr', question: 'How do you track attendance?', options: [{ label: 'Manual/honor system', points: 1 }, { label: 'Spreadsheet', points: 2 }, { label: 'Digital system', points: 3 }] },
  { id: 'h3', step: 4, category: 'hr', question: 'Performance reviews?', options: [{ label: 'Rarely', points: 1 }, { label: 'Annually', points: 2 }, { label: 'Quarterly+', points: 3 }] },
  { id: 'h4', step: 4, category: 'hr', question: 'Payroll process?', options: [{ label: 'Manual', points: 1 }, { label: 'Spreadsheet-based', points: 2 }, { label: 'Automated', points: 3 }] },

  // Step 5: Comprehensive (Q17-20)
  { id: 'c1', step: 5, category: 'sales', question: 'Do you track customer satisfaction?', options: [{ label: 'No', points: 1 }, { label: 'Ad-hoc feedback', points: 2 }, { label: 'Systematic surveys', points: 3 }] },
  { id: 'c2', step: 5, category: 'invoicing', question: 'Multi-currency support needed?', options: [{ label: 'No, single currency', points: 1 }, { label: 'Occasional', points: 2 }, { label: 'Yes, critical', points: 3 }] },
  { id: 'c3', step: 5, category: 'finance', question: 'Need forecasting/budgeting?', options: [{ label: 'Not yet', points: 1 }, { label: 'Basic', points: 2 }, { label: 'Advanced', points: 3 }] },
  { id: 'c4', step: 5, category: 'hr', question: 'Remote work management needed?', options: [{ label: 'All in-office', points: 1 }, { label: 'Hybrid', points: 2 }, { label: 'Fully remote', points: 3 }] },
]

export default function AssessmentPage() {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [completed, setCompleted] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  const currentQuestions = QUIZ_DATA.filter((q) => q.step === step)
  const totalSteps = Math.max(...QUIZ_DATA.map((q) => q.step))
  const progress = ((step - 1) / totalSteps) * 100

  const score = Object.values(answers).reduce((s, p) => s + p, 0)
  const maxScore = QUIZ_DATA.length * 3
  const percentage = Math.round((score / maxScore) * 100)

  async function selectAnswer(qId: string, points: number) {
    setAnswers((a) => ({ ...a, [qId]: points }))
  }

  async function nextStep() {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      await completeAssessment()
    }
  }

  async function completeAssessment() {
    const recommendations = generateRecommendations(percentage)
    const featureFlags = generateFlags(percentage)

    const payload = { assessment_score: percentage, recommendations, feature_flags: featureFlags, completed_at: new Date().toISOString() }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_profiles').upsert({ user_id: user.id, ...payload })
    }

    setProfile(payload)
    setCompleted(true)
  }

  function generateRecommendations(pct: number) {
    const recs = []
    if (pct < 40) recs.push('Start with basic Invoicing module to organize finances')
    if (pct < 50) recs.push('Implement CRM to track sales pipeline')
    if (pct >= 50 && pct < 70) recs.push('Advanced reporting and forecasting recommended')
    if (pct >= 70) recs.push('Unlock full HR and compliance features')
    return recs
  }

  function generateFlags(pct: number) {
    return {
      invoicing: pct >= 30,
      crm: pct >= 40,
      inventory: pct >= 50,
      hr: pct >= 60,
      analytics: pct >= 70,
    }
  }

  if (completed && profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Complete!</CardTitle>
            <CardDescription>Your business readiness score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl font-bold text-blue-400">
                {percentage}%
              </motion.div>
              <div className="text-lg">Your business maturity score</div>

              <div className="space-y-3">
                <h3 className="font-semibold">Recommendations:</h3>
                {profile.recommendations.map((rec, i) => (
                  <div key={i} className="bg-slate-800 p-3 rounded">
                    {rec}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Unlocked Features:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(profile.feature_flags).map(([feature, unlocked]) => (
                    <Button key={feature} variant={unlocked ? 'default' : 'outline'} disabled={!unlocked}>
                      {feature.charAt(0).toUpperCase() + feature.slice(1)} {unlocked ? '✓' : '🔒'}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={() => window.location.href = '/dashboard'} size="lg">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Business Readiness Assessment</h2>

      <Card>
        <CardHeader>
          <CardTitle>Step {step} of {totalSteps}: {['Sales', 'Invoicing', 'Finance', 'HR', 'Comprehensive'][step - 1]}</CardTitle>
          <div className="w-full bg-slate-700 h-2 rounded mt-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="bg-blue-500 h-full rounded transition-all" />
          </div>
          <CardDescription>{Math.round(progress)}% complete</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentQuestions.map((q) => (
              <div key={q.id} className="bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium mb-3">{q.question}</h4>
                <div className="space-y-2">
                  {q.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(q.id, opt.points)}
                      className={`w-full p-3 rounded text-left transition ${
                        answers[q.id] === opt.points ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} variant="outline">
              Previous
            </Button>
            <Button onClick={nextStep} disabled={currentQuestions.some((q) => !answers[q.id])}>
              {step === totalSteps ? 'Complete' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
