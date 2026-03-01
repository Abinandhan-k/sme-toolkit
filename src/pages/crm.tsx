import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Phone } from 'lucide-react'

export default function CRM() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">{t('nav.crm')}</h1>
        <Button>
          <Plus size={18} className="mr-2" />
          {t('common.add')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone size={24} />
            CRM & Follow-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">{t('common.noData')}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
