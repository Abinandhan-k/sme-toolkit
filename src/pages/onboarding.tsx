import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    title: 'Welcome to SME Toolkit',
    description: 'Your all-in-one business management platform',
    content: '🚀 Manage invoices, customers, inventory, HR, and more in one place.',
  },
  {
    title: 'Pre-built Templates',
    description: 'Start with industry templates',
    content: '📋 Sales pipelines, invoice templates, employee records—everything ready to go.',
  },
  {
    title: 'தமிழ் ஆதரவு',
    description: 'Full Tamil language support',
    content: '🌏 Switch to Tamil anytime from settings for a fully localized experience.',
  },
  {
    title: 'Ready to Start',
    description: 'Let\'s set up your business',
    content: '⚡ We\'ll create sample data so you can explore all features immediately.',
  },
]

export default function OnboardingPage() {
  const [slide, setSlide] = useState(0)
  const [creating, setCreating] = useState(false)

  async function createSampleData() {
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create sample customers
      const customers = [
        { name: 'Acme Corp', email: 'contact@acme.com', phone: '9876543210', company: 'Acme Corp' },
        { name: 'Beta Industries', email: 'info@beta.com', phone: '9876543211', company: 'Beta Industries' },
        { name: 'Gamma Solutions', email: 'sales@gamma.com', phone: '9876543212', company: 'Gamma Solutions' },
      ]
      await supabase.from('customers').insert(customers).then(() => console.log('✓ Customers created'))

      // Create sample items
      const items = [
        { name: 'Widget Pro', price: 150, stock: 100, category: 'Finished', barcode: 'WID-001' },
        { name: 'Gadget Plus', price: 250, stock: 50, category: 'Finished', barcode: 'GAD-001' },
        { name: 'Service Pack', price: 500, stock: 25, category: 'Service', barcode: 'SVC-001' },
        { name: 'Raw Material A', price: 50, stock: 200, category: 'Raw', barcode: 'RAW-001' },
      ]
      await supabase.from('items').insert(items).then(() => console.log('✓ Items created'))

      // Create sample invoices
      const invoices = [
        { customer_name: 'Acme Corp', amount: 5000, status: 'paid', items: [{ name: 'Widget Pro', qty: 5, price: 150 }] },
        { customer_name: 'Beta Industries', amount: 7500, status: 'pending', items: [{ name: 'Gadget Plus', qty: 3, price: 250 }] },
      ]
      await supabase.from('invoices').insert(invoices).then(() => console.log('✓ Invoices created'))

      // Create sample tasks
      const tasks = [
        { title: 'Follow up with Acme', description: 'Check on outstanding payment', status: 'todo', assignee: 'Sales Team', due_date: new Date(Date.now() + 86400000).toISOString() },
        { title: 'Prepare Q1 Report', description: 'Financial summary', status: 'in_progress', assignee: 'Finance', due_date: new Date(Date.now() + 259200000).toISOString() },
        { title: 'Onboard new hire', description: 'Complete HR documentation', status: 'todo', assignee: 'HR', due_date: new Date(Date.now() + 604800000).toISOString() },
      ]
      await supabase.from('tasks').insert(tasks).then(() => console.log('✓ Tasks created'))

      // Create sample employees
      const employees = [
        { name: 'John Sales', email: 'john@sme.local', role: 'Sales Manager', status: 'active' },
        { name: 'Jane Finance', email: 'jane@sme.local', role: 'Finance Manager', status: 'active' },
        { name: 'Bob HR', email: 'bob@sme.local', role: 'HR Officer', status: 'active' },
      ]
      await supabase.from('employees').insert(employees).then(() => console.log('✓ Employees created'))

      // Create sample vendors
      const vendors = [
        { name: 'Supplier Co', contact_person: 'Mr. Supplier', email: 'vendor@supplier.com', phone: '9123456789', rating: 4 },
        { name: 'Bulk Foods Ltd', contact_person: 'Ms. Foods', email: 'bulk@foods.com', phone: '9123456790', rating: 5 },
      ]
      await supabase.from('vendors').insert(vendors).then(() => console.log('✓ Vendors created'))

      // Mark onboarding complete
      await supabase.from('user_profiles').upsert({ user_id: user.id, onboarded: true })

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
    } catch (error) {
      console.error('Error creating sample data:', error)
      setCreating(false)
    }
  }

  function nextSlide() {
    if (slide < SLIDES.length - 1) setSlide(slide + 1)
  }

  function prevSlide() {
    if (slide > 0) setSlide(slide - 1)
  }

  const current = SLIDES[slide]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            <motion.div key={slide} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{current.title}</h2>
                  <p className="text-white/60">{current.description}</p>
                </div>

                <div className="bg-slate-800 p-8 rounded-lg text-center text-4xl">
                  {current.content}
                </div>

                {slide === SLIDES.length - 1 && (
                  <div className="bg-blue-900/30 border border-blue-500 rounded p-4 text-sm">
                    We'll automatically create sample data (customers, invoices, items, tasks, employees) so you can explore everything right away.
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={prevSlide} disabled={slide === 0} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  {slide < SLIDES.length - 1 ? (
                    <Button onClick={nextSlide} className="flex-1">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button onClick={createSampleData} disabled={creating} className="flex-1">
                      {creating ? 'Creating...' : 'Get Started'}
                    </Button>
                  )}
                </div>

                <div className="flex justify-center gap-2">
                  {SLIDES.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition ${i === slide ? 'bg-blue-500 w-6' : 'bg-slate-600 w-2'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
