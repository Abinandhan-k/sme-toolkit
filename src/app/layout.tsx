import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { useTranslation } from 'react-i18next'
import {
  Menu,
  LogOut,
  Settings,
  Globe,
  Home,
  Users,
  FileText,
  Box,
  Phone,
  ClipboardList,
  Truck,
  Users2,
  BarChart2,
  Bell,
  Search,
  User,
  Sun,
  Moon,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { path: '/', label: 'nav.dashboard', Icon: Home },
  { path: '/invoices', label: 'nav.invoices', Icon: FileText },
  { path: '/items', label: 'nav.items', Icon: Box },
  { path: '/customers', label: 'nav.customers', Icon: Users },
  { path: '/crm', label: 'nav.crm', Icon: Phone },
  { path: '/tasks', label: 'nav.tasks', Icon: ClipboardList },
  { path: '/vendors', label: 'nav.vendors', Icon: Truck },
  { path: '/hr', label: 'nav.hr', Icon: Users2 },
  { path: '/assessment', label: 'nav.assessment', Icon: BarChart2 },
  { path: '/settings', label: 'nav.settings', Icon: Settings },
]

function Breadcrumbs() {
  const location = useLocation()
  const { t } = useTranslation()
  const parts = location.pathname.split('/').filter(Boolean)

  return (
    <nav className="text-sm text-white/60 mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li>
          <Link to="/" className="hover:underline text-white/70">{t('nav.dashboard')}</Link>
        </li>
        {parts.map((p, i) => (
          <li key={p} className="flex items-center gap-2">
            <span className="text-white/40">/</span>
            <span className="text-white/60">{t(`nav.${p}`) || p}</span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function RootLayout() {
  const { signOut } = useAuth()
  const { t, i18n } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && localStorage.getItem('theme')) === 'light' ? 'light' : 'dark')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    // close mobile drawer on route change
    setMobileOpen(false)
  }, [location.pathname])

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900 text-white">
      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || mobileOpen) && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden sm:flex flex-col bg-white/6 backdrop-blur-lg border-r border-white/10 p-3 gap-4 transition-all duration-300`}
            >
              <div className="flex items-center justify-between px-2">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">SM</div>
                  {sidebarOpen && <span className="font-semibold text-lg">SME Toolkit</span>}
                </Link>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-white/10">
                  <Menu size={18} />
                </button>
              </div>

              <nav className="flex-1 space-y-2 px-1">
                {navItems.map(({ path, label, Icon }) => {
                  const active = location.pathname === path
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-white/80 hover:bg-white/5'}`}
                    >
                      <Icon className="w-5 h-5" />
                      {sidebarOpen && <span className="text-sm">{t(label)}</span>}
                    </Link>
                  )
                })}
              </nav>

              <div className="space-y-2 px-2">
                <button onClick={toggleLanguage} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                  <Globe className="w-4 h-4" />
                  {sidebarOpen && (i18n.language === 'en' ? 'EN' : 'TA')}
                </button>
                <Link to="/settings" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                  <Settings className="w-4 h-4" />
                  {sidebarOpen && t('nav.settings')}
                </Link>
                <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm text-red-300">
                  <LogOut className="w-4 h-4" />
                  {sidebarOpen && t('nav.logout')}
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Drawer Button */}
        <div className="sm:hidden p-2">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-md hover:bg-white/10">
            <Menu />
          </button>
        </div>

        {/* Mobile Drawer Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div className="fixed inset-0 z-40 sm:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
              <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: 'spring' }} className="absolute left-0 top-0 bottom-0 w-64 bg-white/6 backdrop-blur-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">SM</div>
                    <span className="font-semibold text-lg">SME Toolkit</span>
                  </Link>
                  <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-white/10">✕</button>
                </div>
                <nav className="space-y-2">
                  {navItems.map(({ path, label, Icon }) => (
                    <Link key={path} to={path} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{t(label)}</span>
                    </Link>
                  ))}
                </nav>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-h-screen flex flex-col">
          {/* Topbar */}
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/8 bg-white/3 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-white/10">
                  <Menu />
                </button>
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">SM</div>
                  <span className="font-semibold">SME Toolkit</span>
                </Link>
              </div>

              {/* Global Search */}
              <div className="hidden md:flex items-center bg-white/5 backdrop-blur rounded-lg px-3 py-1 gap-2 w-[420px]">
                <Search className="w-4 h-4 text-white/70" />
                <input aria-label="Search" placeholder="Search..." className="bg-transparent outline-none text-sm text-white/90 w-full" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button aria-label="Notifications" className="relative p-2 rounded-md hover:bg-white/10">
                <Bell />
                <span className="absolute right-0 top-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-black" />
              </button>

              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-md hover:bg-white/10">
                {theme === 'dark' ? <Sun /> : <Moon />}
              </button>

              <div className="relative">
                <button className="flex items-center gap-2 p-1 rounded-md hover:bg-white/5" onClick={() => navigate('/settings')}>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">U</div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm">Account</div>
                    <div className="text-xs text-white/60">Profile</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Page content with transitions */}
          <main className="flex-1 overflow-auto p-6">
            <Breadcrumbs />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={location.pathname} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.24 }}>
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
