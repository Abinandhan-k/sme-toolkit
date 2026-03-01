export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          customer_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          amount: number
          status: 'draft' | 'sent' | 'paid' | 'overdue'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          amount: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
        }
        Update: {
          amount?: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
        }
      }
      items: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          price: number
          quantity: number
          unit: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          price: number
          quantity: number
          unit: string
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          quantity?: number
          unit?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
