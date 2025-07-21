import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface Product {
  id: string
  amazon_id: string
  title: string
  description: string
  price: string
  original_price?: string
  image: string
  category: string
  rating: number
  review_count: number
  discount?: number
  tags: string[]
  link: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Banner {
  id: string
  image_url: string
  alt_text?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
