export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notification_settings: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          notify_on_admin_actions: boolean | null
          notify_on_critical_only: boolean | null
          notify_on_security_events: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          notify_on_admin_actions?: boolean | null
          notify_on_critical_only?: boolean | null
          notify_on_security_events?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          notify_on_admin_actions?: boolean | null
          notify_on_critical_only?: boolean | null
          notify_on_security_events?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          background_color: string | null
          button_text: string | null
          created_at: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          message: string
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          button_text?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message: string
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          button_text?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message?: string
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean | null
          label: string
          phone: string | null
          postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean | null
          label?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          label?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          min_order: number
          type: string
          updated_at: string
          usage_limit: number
          used_count: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          min_order?: number
          type: string
          updated_at?: string
          usage_limit?: number
          used_count?: number
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          min_order?: number
          type?: string
          updated_at?: string
          usage_limit?: number
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          click_rate: number | null
          created_at: string
          id: string
          name: string
          open_rate: number | null
          recipients: number
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          template: string
          updated_at: string
        }
        Insert: {
          click_rate?: number | null
          created_at?: string
          id?: string
          name: string
          open_rate?: number | null
          recipients?: number
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template?: string
          updated_at?: string
        }
        Update: {
          click_rate?: number | null
          created_at?: string
          id?: string
          name?: string
          open_rate?: number | null
          recipients?: number
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          order_id: string | null
          order_number: string | null
          provider_response: Json | null
          recipient_email: string
          status: string
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          order_id?: string | null
          order_number?: string | null
          provider_response?: Json | null
          recipient_email: string
          status?: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          order_id?: string | null
          order_number?: string | null
          provider_response?: Json | null
          recipient_email?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          product_image?: string | null
          product_name: string
          quantity: number
          size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          discount_amount: number | null
          discount_code_id: string | null
          id: string
          notes: string | null
          order_number: string | null
          payment_method: string
          shipping_address: string
          shipping_city: string
          shipping_postal_code: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          discount_code_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_method: string
          shipping_address: string
          shipping_city: string
          shipping_postal_code?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          discount_code_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_method?: string
          shipping_address?: string
          shipping_city?: string
          shipping_postal_code?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_admin_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          colors: Json | null
          created_at: string
          description: string | null
          id: string
          images: string[]
          in_stock: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          name: string
          original_price: number | null
          price: number
          rating: number | null
          review_count: number | null
          sizes: string[] | null
          slug: string
          stock_quantity: number | null
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          category: string
          colors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          in_stock?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name: string
          original_price?: number | null
          price: number
          rating?: number | null
          review_count?: number | null
          sizes?: string[] | null
          slug: string
          stock_quantity?: number | null
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          colors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          in_stock?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          sizes?: string[] | null
          slug?: string
          stock_quantity?: number | null
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_payment_methods: {
        Row: {
          card_brand: string
          card_holder_name: string
          card_last_four: string
          created_at: string
          expiry_month: number
          expiry_year: number
          id: string
          is_default: boolean | null
          user_id: string
        }
        Insert: {
          card_brand: string
          card_holder_name: string
          card_last_four: string
          created_at?: string
          expiry_month: number
          expiry_year: number
          id?: string
          is_default?: boolean | null
          user_id: string
        }
        Update: {
          card_brand?: string
          card_holder_name?: string
          card_last_four?: string
          created_at?: string
          expiry_month?: number
          expiry_year?: number
          id?: string
          is_default?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          blocked: boolean | null
          city: string | null
          country: string | null
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          request_path: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          blocked?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          request_path?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          blocked?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          request_path?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      inquiries_user_view: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string | null
          id: string | null
          message: string | null
          name: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: never
          created_at?: string | null
          email?: string | null
          id?: string | null
          message?: string | null
          name?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: never
          created_at?: string | null
          email?: string | null
          id?: string | null
          message?: string | null
          name?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_insert_order_item: { Args: { _order_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
    },
  },
} as const
