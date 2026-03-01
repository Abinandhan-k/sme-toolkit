import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/app/providers'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Globe } from 'lucide-react'

type Language = 'en' | 'ta'

interface Question {
  id: number
  en: string
  ta: string
}

interface Answer {
  questionId: number
  score: number
}

// Assessment questions in both languages
const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: 1,
    en: 'Does your business have a formal accounting system?',
    ta: 'உங்கள் வணிகத்திற்கு ஒரு முறையான கணக்கியல் வ்யவஸ்థ உள்ளதா?',
  },
  {
    id: 2,
    en: 'Do you maintain inventory records?',
    ta: 'நீங்கள் கையிருப்பு பதிவுகளை பராமரிக்கிறீர்களா?',
  },
  {
    id: 3,
    en: 'Do you use digital tools for business operations?',
    ta: 'வணிக செயல்பாடுகளுக்கு நீங்கள் ডिजिटल கருவிகளைப் பயன்படுத்துகிறீர்களா?',
  },
  {
    id: 4,
    en: 'Do you have a customer database or CRM?',
    ta: 'உங்களிடம் ஒரு வாடிக்கையாளர் ডাटাবேஸ் அல்லது CRM உள்ளதா?',
  },
  {
    id: 5,
    en: 'Do you generate and track sales invoices?',
    ta: 'நீங்கள் விற்பனை ரசீதுகளை உருவாக்கி கண்காணிக்கிறீர்களா?',
  },
  {
    id: 6,
    en: 'Do you plan your expenses and budgets?',
    ta: 'நீங்கள் உங்கள் செலவுகள் மற்றும் வரவு செலவுக்கட்டை திட்டமிடுகிறீர்களா?',
  },
  {
    id: 7,
    en: 'Do you have a written business strategy?',
    ta: 'உங்களிடம் ஒரு எழுதப்பட்ட ব்যবসায়িক மூலநூல் உள்ளதா?',
  },
  {
    id: 8,
    en: 'Do you track employee performance and payroll?',
    ta: 'நீங்கள் ஊழியர் செயல்பாடு மற்றும் சம்பளத்தை கண்காணிக்கிறீர்களா?',
  },
  {
    id: 9,
    en: 'Do you have regular financial reviews?',
    ta: 'உங்களிடம் நிয়மிত நிதி மதிப்பாய்வுகள் உள்ளனவா?',
  },
  {
    id: 10,
    en: 'Do you use analytics to make business decisions?',
    ta: 'வணிக முடிவுகளை எடுக்க நீங்கள் பகுப்பாய்வுகளைப் பயன்படுத்துகிறீர்களா?',
  },
]

type AssessmentStep = 'language' | 'questions' | 'results'

export default function AssessmentPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [step, setStep] = useState<AssessmentStep>('language')
  const [language, setLanguage] = useState<Language>('en')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang)
    setStep('questions')
  }

  const handleAnswer = (score: number) => {
    const newAnswers = [
      ...answers,
      { questionId: ASSESSMENT_QUESTIONS[currentQuestion].id, score },
    ]
    setAnswers(newAnswers)

    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Last question answered, go to results
      calculateAndSaveResults(newAnswers)
    }
  }

  const calculateAndSaveResults = async (finalAnswers: Answer[]) => {
    setSubmitting(true)
    try {
      const totalScore = finalAnswers.reduce((sum, a) => sum + a.score, 0)
      const percentage = Math.round((totalScore / (ASSESSMENT_QUESTIONS.length * 2)) * 100)

      setFinalScore(percentage)

      // Save assessment result to database
      if (user?.id) {
        await supabase.from('assessment_results').insert({
          user_id: user.id,
          language,
          score: percentage,
          answers: finalAnswers,
          total_questions: ASSESSMENT_QUESTIONS.length,
          completed_at: new Date().toISOString(),
        })

        // Update user profile with assessment score
        await supabase.from('user_profiles').update({
          assessment_score: percentage,
        }).eq('id', user.id)
      }

      setStep('results')
    } catch (error) {
      console.error('Failed to save assessment:', error)
      toast.error('Failed to save assessment results')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRestart = () => {
    setStep('language')
    setCurrentQuestion(0)
    setAnswers([])
    setFinalScore(null)
  }

  if (step === 'language') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={24} />
              {t('common.selectLanguage')}
            </CardTitle>
            <CardDescription>
              Choose your preferred language for the assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={() => handleSelectLanguage('en')}
              className="w-full p-4 border-2 border-white/10 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-all"
            >
              <div className="font-semibold text-white">English</div>
              <div className="text-sm text-white/60">Take assessment in English</div>
            </button>
            <button
              onClick={() => handleSelectLanguage('ta')}
              className="w-full p-4 border-2 border-white/10 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-all"
            >
              <div className="font-semibold text-white">தமிழ்</div>
              <div className="text-sm text-white/60">தமிழ் மொழியில் மதிப்பீட்டை எடுங்கள்</div>
            </button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (step === 'questions') {
    const question = ASSESSMENT_QUESTIONS[currentQuestion]
    const questionText = language === 'en' ? question.en : question.ta

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>
              Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
            </CardTitle>
            <div className="w-full bg-white/10 rounded-full h-2 mt-4">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-xl font-medium text-white mb-6">{questionText}</div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(0)}
                disabled={submitting}
                className="p-4 border-2 border-red-500/50 rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <div className="font-semibold text-white">
                  {language === 'en' ? 'No' : 'இல்லை'}
                </div>
                <div className="text-sm text-white/60">0 points</div>
              </button>

              <button
                onClick={() => handleAnswer(1)}
                disabled={submitting}
                className="p-4 border-2 border-yellow-500/50 rounded-lg hover:border-yellow-500 hover:bg-yellow-500/10 transition-all disabled:opacity-50"
              >
                <div className="font-semibold text-white">
                  {language === 'en' ? 'Partially' : 'பகுதியாக'}
                </div>
                <div className="text-sm text-white/60">1 point</div>
              </button>

              <button
                onClick={() => handleAnswer(2)}
                disabled={submitting}
                className="p-4 border-2 border-green-500/50 rounded-lg hover:border-green-500 hover:bg-green-500/10 transition-all disabled:opacity-50 col-span-2"
              >
                <div className="font-semibold text-white">
                  {language === 'en' ? 'Yes' : 'ஆம்'}
                </div>
                <div className="text-sm text-white/60">2 points</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (step === 'results') {
    const getRecommendation = (score: number) => {
      if (score >= 80) {
        return language === 'en'
          ? 'Excellent! Your business processes are well-established.'
          : 'சிறப்பு! உங்கள் வணிக செயல்முறைகள் நன்கு நிறுவப்பட்டுள்ளன.'
      }
      if (score >= 60) {
        return language === 'en'
          ? 'Good! You have solid business fundamentals. Consider upgrading to Pro for advanced features.'
          : 'நல்லது! உங்களிடம் உறுதியான வணிக அடிப்படைகள் உள்ளன. மேன்மையான அம்சங்களுக்கு பணத்தை மேம்படுத்த பரிசீலிக்கவும்.'
      }
      return language === 'en'
        ? 'Getting started! Upgrade to Pro tier to access tools that will help you improve.'
        : 'தொடங்குதல்! உங்களை மேம்படுத்த உதவი கருவிகளை அணுக Pro அடுக்குக்கு மேம்படுத்தவும்.'
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {language === 'en' ? 'Assessment Complete' : 'மதிப்பீட்டு முடிந்துவிட்டது'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-blue-400">{finalScore}%</div>
              <div className="text-white/70 mt-2">
                {language === 'en' ? 'Your Score' : 'உங்கள் மதிப்பெண்'}
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-white text-sm">{getRecommendation(finalScore || 0)}</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRestart}
                variant="outline"
                className="w-full"
              >
                {language === 'en' ? 'Retake Assessment' : 'மதிப்பீட்டை மீண்டும் எடுக்கவும்'}
              </Button>
              <Button className="w-full">
                {language === 'en' ? 'Upgrade to Pro' : 'Pro-க்கு மேம்படுத்தவும்'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return null
}
