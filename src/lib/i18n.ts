import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        customers: 'Customers',
        invoices: 'Invoices',
        items: 'Items',
        crm: 'CRM',
        tasks: 'Tasks',
        vendors: 'Vendors',
        hr: 'HR',
        assessment: 'Assessment',
        analytics: 'Analytics',
        settings: 'Settings',
        logout: 'Logout',
      },
      // Auth
      auth: {
        title: 'SME Toolkit',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        email: 'Email',
        password: 'Password',
        fullName: 'Full Name',
        forgotPassword: 'Forgot Password?',
        noAccount: 'Don\'t have an account?',
        haveAccount: 'Already have an account?',
        signInWithOTP: 'Sign in with OTP',
        verifyOTP: 'Verify OTP',
        enterOTP: 'Enter OTP',
        resendOTP: 'Resend OTP',
        selectRole: 'Select Your Role',
        role: {
          owner: 'Business Owner',
          accountant: 'Accountant',
          storekeeper: 'Store Keeper',
          admin: 'Admin',
        },
      },
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        welcomeBack: 'Welcome back',
        totalRevenue: 'Total Revenue',
        totalInvoices: 'Total Invoices',
        totalCustomers: 'Total Customers',
        recentInvoices: 'Recent Invoices',
      },
      // Common
      common: {
        add: 'Add',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        search: 'Search',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        noData: 'No data found',
      },
    },
  },
  ta: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'இயக்கணை',
        customers: 'வாடிக்கையாளர்கள்',
        invoices: 'ஏற்பாடுகள்',
        items: 'பொருட்கள்',
        crm: 'வாடிக்கையாளர் தொடர்பு',
        tasks: 'பணிகள்',
        vendors: 'விற்பனையாளர்கள்',
        hr: 'மனிதவளம்',
        assessment: 'மதிப்பீடு',
        analytics: 'பகுப்பாய்வு',
        settings: 'அமைப்புகள்',
        logout: 'வெளியேறு',
      },
      // Auth
      auth: {
        title: 'SME கருவிப்பெட்டி',
        signIn: 'உள்நுழைக',
        signUp: 'பதிவுசெய்க',
        email: 'மின்னஞ்சல்',
        password: 'கடவுச்சொல்',
        fullName: 'முழு பெயர்',
        forgotPassword: 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
        noAccount: 'கணக்கு இல்லை?',
        haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
        signInWithOTP: 'OTP மூலம் உள்நுழைக',
        verifyOTP: 'OTP சரிபார்க்க',
        enterOTP: 'OTP உள்ளிடவும்',
        resendOTP: 'OTP மீண்டும் அனுப்பவும்',
        selectRole: 'உங்கள் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்',
        role: {
          owner: 'வணிக உரிமையாளர்',
          accountant: 'கணக்காளர்',
          storekeeper: 'கடை காப்பாளர்',
          admin: 'நிர்வாகி',
        },
      },
      // Dashboard
      dashboard: {
        title: 'இயக்கணை',
        welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
        totalRevenue: 'மொத்த வருவாய்',
        totalInvoices: 'மொத்த ஏற்பாடுகள்',
        totalCustomers: 'மொத்த வாடிக்கையாளர்கள்',
        recentInvoices: 'சமீபத்திய ஏற்பாடுகள்',
      },
      // Common
      common: {
        add: 'சேர்க்க',
        edit: 'திருத்த',
        delete: 'அழிக்க',
        save: 'சேமிக்க',
        cancel: 'ரத்து செய்க',
        search: 'தேடவும்',
        loading: 'ஏற்றுகிறது...',
        error: 'பிழை',
        success: 'வெற்றி',
        noData: 'தரவு கிடைக்கவில்லை',
      },
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
