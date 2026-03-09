export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: "admin" | "coach" | "fighter"
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: "admin" | "coach" | "fighter"
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: "admin" | "coach" | "fighter"
          avatar_url?: string | null
          created_at?: string
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          city: string | null
          country: string | null
          logo_url: string | null
          coach_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city?: string | null
          country?: string | null
          logo_url?: string | null
          coach_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string | null
          country?: string | null
          logo_url?: string | null
          coach_id?: string | null
          created_at?: string
        }
      }
      weight_classes: {
        Row: {
          id: string
          name: string
          gender: "male" | "female" | "open"
          limit_kg: number | null
          sort_order: number | null
        }
        Insert: {
          id?: string
          name: string
          gender?: "male" | "female" | "open"
          limit_kg?: number | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          name?: string
          gender?: "male" | "female" | "open"
          limit_kg?: number | null
          sort_order?: number | null
        }
      }
      fighters: {
        Row: {
          id: string
          club_id: string | null
          weight_class: string | null
          wins: number
          losses: number
          draws: number
          date_of_birth: string | null
          nationality: string | null
          bio: string | null
        }
        Insert: {
          id: string
          club_id?: string | null
          weight_class?: string | null
          wins?: number
          losses?: number
          draws?: number
          date_of_birth?: string | null
          nationality?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          club_id?: string | null
          weight_class?: string | null
          wins?: number
          losses?: number
          draws?: number
          date_of_birth?: string | null
          nationality?: string | null
          bio?: string | null
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          date: string | null
          location: string | null
          weight_class: string | null
          status: "upcoming" | "active" | "completed"
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          date?: string | null
          location?: string | null
          weight_class?: string | null
          status?: "upcoming" | "active" | "completed"
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string | null
          location?: string | null
          weight_class?: string | null
          status?: "upcoming" | "active" | "completed"
          created_by?: string | null
          created_at?: string
        }
      }
      tournament_registrations: {
        Row: {
          id: string
          tournament_id: string
          fighter_id: string
          status: "pending" | "approved" | "rejected"
          registered_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          fighter_id: string
          status?: "pending" | "approved" | "rejected"
          registered_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          fighter_id?: string
          status?: "pending" | "approved" | "rejected"
          registered_at?: string
        }
      }
      bouts: {
        Row: {
          id: string
          tournament_id: string | null
          fighter_a_id: string | null
          fighter_b_id: string | null
          winner_id: string | null
          method: string | null
          round: number | null
          bout_order: number | null
          status: "scheduled" | "completed"
        }
        Insert: {
          id?: string
          tournament_id?: string | null
          fighter_a_id?: string | null
          fighter_b_id?: string | null
          winner_id?: string | null
          method?: string | null
          round?: number | null
          bout_order?: number | null
          status?: "scheduled" | "completed"
        }
        Update: {
          id?: string
          tournament_id?: string | null
          fighter_a_id?: string | null
          fighter_b_id?: string | null
          winner_id?: string | null
          method?: string | null
          round?: number | null
          bout_order?: number | null
          status?: "scheduled" | "completed"
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          body: string
          author_id: string | null
          club_id: string | null
          status: "pending" | "approved" | "rejected"
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          author_id?: string | null
          club_id?: string | null
          status?: "pending" | "approved" | "rejected"
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          author_id?: string | null
          club_id?: string | null
          status?: "pending" | "approved" | "rejected"
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
      }
      training_sessions: {
        Row: {
          id: string
          club_id: string
          title: string
          session_type: "striking" | "grappling" | "sparring" | "conditioning" | "open_mat" | "other" | null
          day_of_week: number | null
          start_time: string
          end_time: string
          location: string | null
          notes: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          club_id: string
          title: string
          session_type?: "striking" | "grappling" | "sparring" | "conditioning" | "open_mat" | "other" | null
          day_of_week?: number | null
          start_time: string
          end_time: string
          location?: string | null
          notes?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          club_id?: string
          title?: string
          session_type?: "striking" | "grappling" | "sparring" | "conditioning" | "open_mat" | "other" | null
          day_of_week?: number | null
          start_time?: string
          end_time?: string
          location?: string | null
          notes?: string | null
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
