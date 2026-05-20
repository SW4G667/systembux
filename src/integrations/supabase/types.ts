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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliate_earnings: {
        Row: {
          affiliate_user_id: string
          cashback_earned: number
          created_at: string
          id: string
          order_id: string | null
          points_earned: number
          referred_user_id: string
        }
        Insert: {
          affiliate_user_id: string
          cashback_earned?: number
          created_at?: string
          id?: string
          order_id?: string | null
          points_earned?: number
          referred_user_id: string
        }
        Update: {
          affiliate_user_id?: string
          cashback_earned?: number
          created_at?: string
          id?: string
          order_id?: string | null
          points_earned?: number
          referred_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          link: string | null
          starts_at: string
          title: string
          variant: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          link?: string | null
          starts_at?: string
          title: string
          variant?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          link?: string | null
          starts_at?: string
          title?: string
          variant?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          ip: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cashback_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashback_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_amount: number
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_amount: number
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_amount?: number
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_amount?: number
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number
          used_count?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          icon: string | null
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_notes: string | null
          coupon_code: string | null
          created_at: string
          delivered_at: string | null
          delivery_data: Json | null
          discount: number
          gamepass_url: string | null
          id: string
          notes: string | null
          order_number: string
          paid_at: string | null
          product_category: Database["public"]["Enums"]["product_category"]
          product_id: string | null
          product_name: string
          quantity: number
          roblox_nick: string | null
          robux_amount: number | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          coupon_code?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_data?: Json | null
          discount?: number
          gamepass_url?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          product_category: Database["public"]["Enums"]["product_category"]
          product_id?: string | null
          product_name: string
          quantity?: number
          roblox_nick?: string | null
          robux_amount?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          coupon_code?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_data?: Json | null
          discount?: number
          gamepass_url?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          product_category?: Database["public"]["Enums"]["product_category"]
          product_id?: string | null
          product_name?: string
          quantity?: number
          roblox_nick?: string | null
          robux_amount?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          method: string
          order_id: string
          paid_at: string | null
          pix_copy_paste: string | null
          pix_qr_code: string | null
          provider: string
          provider_payment_id: string | null
          raw_response: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
          webhook_payload: Json | null
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          method?: string
          order_id: string
          paid_at?: string | null
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          provider?: string
          provider_payment_id?: string | null
          raw_response?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
          webhook_payload?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          method?: string
          order_id?: string
          paid_at?: string | null
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          provider?: string
          provider_payment_id?: string | null
          raw_response?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
          webhook_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      points_history: {
        Row: {
          created_at: string
          delta: number
          id: string
          reason: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          reason: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          reason?: string
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          metadata: Json | null
          name: string
          original_price: number | null
          price: number
          sales_count: number
          slug: string
          stock: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          metadata?: Json | null
          name: string
          original_price?: number | null
          price: number
          sales_count?: number
          slug: string
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          metadata?: Json | null
          name?: string
          original_price?: number | null
          price?: number
          sales_count?: number
          slug?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          affiliate_code: string
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          cashback_balance: number
          created_at: string
          daily_login_streak: number
          display_name: string | null
          email: string | null
          id: string
          is_banned: boolean
          last_login_at: string | null
          points: number
          referred_by: string | null
          total_spent: number
          updated_at: string
          user_id: string
          username: string
          vip_tier: Database["public"]["Enums"]["vip_tier"]
        }
        Insert: {
          affiliate_code: string
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          cashback_balance?: number
          created_at?: string
          daily_login_streak?: number
          display_name?: string | null
          email?: string | null
          id?: string
          is_banned?: boolean
          last_login_at?: string | null
          points?: number
          referred_by?: string | null
          total_spent?: number
          updated_at?: string
          user_id: string
          username: string
          vip_tier?: Database["public"]["Enums"]["vip_tier"]
        }
        Update: {
          affiliate_code?: string
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          cashback_balance?: number
          created_at?: string
          daily_login_streak?: number
          display_name?: string | null
          email?: string | null
          id?: string
          is_banned?: boolean
          last_login_at?: string | null
          points?: number
          referred_by?: string | null
          total_spent?: number
          updated_at?: string
          user_id?: string
          username?: string
          vip_tier?: Database["public"]["Enums"]["vip_tier"]
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          is_admin: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "moderator" | "admin"
      notification_type:
        | "order"
        | "payment"
        | "cashback"
        | "points"
        | "promo"
        | "admin"
        | "ticket"
        | "welcome"
        | "system"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_status: "pending" | "approved" | "expired" | "failed" | "refunded"
      product_category:
        | "robux"
        | "mm2"
        | "accounts"
        | "giftcards"
        | "gamepasses"
        | "services"
        | "scripts"
      ticket_status: "open" | "pending" | "answered" | "closed"
      vip_tier: "bronze" | "silver" | "gold" | "diamond"
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
      app_role: ["user", "moderator", "admin"],
      notification_type: [
        "order",
        "payment",
        "cashback",
        "points",
        "promo",
        "admin",
        "ticket",
        "welcome",
        "system",
      ],
      order_status: [
        "pending",
        "paid",
        "processing",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_status: ["pending", "approved", "expired", "failed", "refunded"],
      product_category: [
        "robux",
        "mm2",
        "accounts",
        "giftcards",
        "gamepasses",
        "services",
        "scripts",
      ],
      ticket_status: ["open", "pending", "answered", "closed"],
      vip_tier: ["bronze", "silver", "gold", "diamond"],
    },
  },
} as const
