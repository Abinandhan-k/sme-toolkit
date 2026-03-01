import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export default function AuthLayout() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-lg text-white transition-all z-10"
      >
        <Globe size={18} />
        {i18n.language === 'en' ? 'தமிழ்' : 'EN'}
      </button>

      {/* Content */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}
