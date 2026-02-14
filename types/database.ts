export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          category_id: string | null
          price: number
          currency: string
          image_url: string | null
          stock_quantity: number
          is_available: boolean
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          category_id?: string | null
          price: number
          currency?: string
          image_url?: string | null
          stock_quantity?: number
          is_available?: boolean
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          category_id?: string | null
          price?: number
          currency?: string
          image_url?: string | null
          stock_quantity?: number
          is_available?: boolean
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          total_amount: number
          order_status: string
          payment_method: string
          payment_status: string
          delivery_status: string
          customer_phone: string | null
          player_uid: string | null
          remarks: string | null
          payment_screenshot_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          total_amount: number
          order_status?: string
          payment_method: string
          payment_status?: string
          delivery_status?: string
          customer_phone?: string | null
          player_uid?: string | null
          remarks?: string | null
          payment_screenshot_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          total_amount?: number
          order_status?: string
          payment_method?: string
          payment_status?: string
          delivery_status?: string
          customer_phone?: string | null
          player_uid?: string | null
          remarks?: string | null
          payment_screenshot_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      cart: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
      }
    }
  }
}