import { useTranslation } from 'react-i18next'
import type { UserRole } from '@/types/auth'

interface RoleSelectorProps {
  value: UserRole
  onChange: (role: UserRole) => void
  disabled?: boolean
}

export default function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  const { t } = useTranslation()

  const roles: { value: UserRole; label: string; description: string }[] = [
    {
      value: 'owner',
      label: t('auth.role.owner') || 'Business Owner',
      description: 'Full access to all features',
    },
    {
      value: 'accountant',
      label: t('auth.role.accountant') || 'Accountant',
      description: 'Manage finances and reports',
    },
    {
      value: 'storekeeper',
      label: t('auth.role.storekeeper') || 'Store Keeper',
      description: 'Inventory and sales management',
    },
  ]

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white">{t('auth.selectRole') || 'Select Your Role'}</label>
      <div className="grid gap-3">
        {roles.map((role) => (
          <label
            key={role.value}
            className={`relative flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
              value === role.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input
              type="radio"
              name="role"
              value={role.value}
              checked={value === role.value}
              onChange={(e) => onChange(e.target.value as UserRole)}
              disabled={disabled}
              className="mt-1 h-4 w-4 cursor-pointer accent-blue-500"
            />
            <div className="flex-1">
              <p className="font-medium text-white">{role.label}</p>
              <p className="text-sm text-white/60">{role.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
