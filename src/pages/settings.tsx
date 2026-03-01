import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/app/providers'
import { useTheme } from '@/app/theme-context'
import { useLanguage } from '@/app/language-context'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Settings as SettingsIcon, Sun, Moon, Globe, Copy, Trash2, Plus, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import RoleSelector from '@/components/RoleSelector'
import type { UserRole } from '@/types/auth'

interface ApiKey {
  id: string
  name: string
  key: string
  created_at: string
  last_used: string | null
}

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { user, signOut, updateRole } = useAuth()
  const { theme, setTheme, toggleTheme } = useTheme()
  const { language, setLanguage: setAppLanguage } = useLanguage()
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'storekeeper')
  const [loadingRole, setLoadingRole] = useState(false)
  
  // App Settings
  const [appName, setAppName] = useState('SME Toolkit')
  const [companyName, setCompanyName] = useState('')
  const [savingApp, setSavingApp] = useState(false)
  
  // Subscription
  const [subscriptionPlan, setSubscriptionPlan] = useState('free')
  const [subscriptionName, setSubscriptionName] = useState('Free Plan')
  
  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [apiKeyName, setApiKeyName] = useState('')
  const [loadingApiKeys, setLoadingApiKeys] = useState(false)
  const [showNewKeyForm, setShowNewKeyForm] = useState(false)
  
  // Data Export
  const [exporting, setExporting] = useState(false)

  // Load user settings and API keys on mount
  useEffect(() => {
    loadUserSettings()
    loadApiKeys()
  }, [user?.id])

  const loadUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('app_name, company_name, subscription_plan')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      if (data) {
        setAppName(data.app_name || 'SME Toolkit')
        setCompanyName(data.company_name || '')
        setSubscriptionPlan(data.subscription_plan || 'free')
        setSubscriptionName(
          data.subscription_plan === 'pro' ? 'Pro Plan' :
          data.subscription_plan === 'enterprise' ? 'Enterprise Plan' :
          'Free Plan'
        )
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadApiKeys = async () => {
    setLoadingApiKeys(true)
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, key, created_at, last_used')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') throw error
      setApiKeys(data || [])
    } catch (error) {
      console.error('Failed to load API keys:', error)
    } finally {
      setLoadingApiKeys(false)
    }
  }

  const handleSaveAppSettings = async () => {
    setSavingApp(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          app_name: appName,
          company_name: companyName,
        })
        .eq('id', user?.id)

      if (error) throw error
      toast.success('App settings saved')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    } finally {
      setSavingApp(false)
    }
  }

  const handleGenerateApiKey = async () => {
    if (!apiKeyName.trim()) {
      toast.error('Please enter a key name')
      return
    }

    setLoadingApiKeys(true)
    try {
      const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      const { error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user?.id,
          name: apiKeyName,
          key: newKey,
          created_at: new Date().toISOString(),
        })

      if (error) throw error
      
      toast.success('API key generated')
      setApiKeyName('')
      setShowNewKeyForm(false)
      loadApiKeys()
    } catch (error) {
      toast.error('Failed to generate API key')
      console.error(error)
    } finally {
      setLoadingApiKeys(false)
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user?.id)

      if (error) throw error
      toast.success('API key deleted')
      loadApiKeys()
    } catch (error) {
      toast.error('Failed to delete API key')
      console.error(error)
    }
  }

  const handleExportData = async (format: 'csv' | 'json') => {
    setExporting(true)
    try {
      const tables = ['customers', 'items', 'invoices', 'tasks', 'leads']
      const exportData: Record<string, any> = {}

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', user?.id)

        if (!error) {
          exportData[table] = data
        }
      }

      let content = ''
      let filename = `sme-toolkit-export-${new Date().toISOString().split('T')[0]}`

      if (format === 'json') {
        content = JSON.stringify(exportData, null, 2)
        filename += '.json'
      } else {
        // Simple CSV export
        const csvContent = Object.entries(exportData)
          .map(([table, rows]) => {
            if (!rows.length) return ''
            const headers = Object.keys(rows[0]).join(',')
            const data = rows.map((row: any) => Object.values(row).map(v => `"${v}"`).join(',')).join('\n')
            return `${table}\n${headers}\n${data}`
          })
          .filter(Boolean)
          .join('\n\n')
        content = csvContent
        filename += '.csv'
      }

      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Data exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export data')
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const handleRoleUpdate = async () => {
    if (selectedRole === user?.role) {
      toast.info('No changes to apply')
      return
    }

    setLoadingRole(true)
    try {
      await updateRole(selectedRole)
    } catch (error) {
      setSelectedRole(user?.role || 'storekeeper')
    } finally {
      setLoadingRole(false)
    }
  }

  const handleLanguageChange = async (lang: 'en' | 'ta') => {
    await setAppLanguage(lang)
    toast.success(`Language changed to ${lang === 'en' ? 'English' : 'Tamil'}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl"
    >
      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
        <SettingsIcon size={32} />
        {t('nav.settings')}
      </h1>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your current account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-white/70">Email</p>
            <p className="text-lg text-white">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Full Name</p>
            <p className="text-lg text-white">{user?.user_metadata?.full_name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">User ID</p>
            <p className="text-sm text-white/50 font-mono">{user?.id}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Email Verified</p>
            <p className={`text-sm ${user?.isEmailVerified ? 'text-green-400' : 'text-yellow-400'}`}>
              {user?.isEmailVerified ? '✓ Verified' : '⚠ Not verified'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <Moon size={16} className="inline mr-2" />
              Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <Sun size={16} className="inline mr-2" />
              Light
            </button>
          </div>
          <p className="text-xs text-white/50 mt-2">Theme preference saved locally</p>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} />
            Language
          </CardTitle>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                language === 'en'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('ta')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                language === 'ta'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Role Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Business Role</CardTitle>
          <CardDescription>Manage your position and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RoleSelector value={selectedRole} onChange={setSelectedRole} disabled={loadingRole} />

          {selectedRole !== user?.role && (
            <Button
              onClick={handleRoleUpdate}
              disabled={loadingRole}
              className="w-full"
            >
              {loadingRole ? 'Updating...' : 'Update Role'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
          <CardDescription>Customize your app branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-white/70 block mb-2">App Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="SME Toolkit"
            />
          </div>
          <div>
            <label className="text-sm text-white/70 block mb-2">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="Your company name"
            />
          </div>
          <Button
            onClick={handleSaveAppSettings}
            disabled={savingApp}
            className="w-full"
          >
            {savingApp ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Your current plan and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${subscriptionPlan === 'free' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
              <p className="font-semibold text-white">Free</p>
              <p className="text-xs text-white/50">Basic features</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${subscriptionPlan === 'pro' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
              <p className="font-semibold text-white">Pro</p>
              <p className="text-xs text-white/50">Advanced features</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${subscriptionPlan === 'enterprise' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
              <p className="font-semibold text-white">Enterprise</p>
              <p className="text-xs text-white/50">All features</p>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-sm text-white/70">Current Plan</p>
            <p className="text-lg font-semibold text-white">{subscriptionName}</p>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage your API keys for integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showNewKeyForm && (
            <Button
              onClick={() => setShowNewKeyForm(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Generate New Key
            </Button>
          )}

          {showNewKeyForm && (
            <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <input
                type="text"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                placeholder="Key name (e.g., Mobile App, Webhook)"
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateApiKey}
                  disabled={loadingApiKeys}
                  className="flex-1"
                >
                  {loadingApiKeys ? 'Generating...' : 'Generate'}
                </Button>
                <Button
                  onClick={() => setShowNewKeyForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {apiKeys.length === 0 ? (
              <p className="text-sm text-white/50 text-center py-4">No API keys yet</p>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{key.name}</p>
                    <p className="text-xs text-white/50 font-mono truncate">{key.key}</p>
                    <p className="text-xs text-white/40 mt-1">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => copyToClipboard(key.key)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Copy key"
                    >
                      <Copy size={16} className="text-white/70" />
                    </button>
                    <button
                      onClick={() => handleDeleteApiKey(key.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete key"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            Data Export
          </CardTitle>
          <CardDescription>Export your data in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleExportData('csv')}
              disabled={exporting}
              className="flex-1 min-w-32"
            >
              {exporting ? 'Exporting...' : 'Export as CSV'}
            </Button>
            <Button
              onClick={() => handleExportData('json')}
              disabled={exporting}
              variant="outline"
              className="flex-1 min-w-32"
            >
              {exporting ? 'Exporting...' : 'Export as JSON'}
            </Button>
          </div>
          <p className="text-xs text-white/50 mt-3">
            Download all your data (customers, items, invoices, tasks, leads) in your preferred format.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={signOut}
            className="w-full sm:w-auto"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
