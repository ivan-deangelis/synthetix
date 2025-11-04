export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_data: {
        Row: {
          ai_constraints: string | null
          ai_prompt: string
          api_set_id: string
          created_at: string | null
          created_by: string
          field_name: string
          id: string
          result: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          ai_constraints?: string | null
          ai_prompt: string
          api_set_id: string
          created_at?: string | null
          created_by?: string
          field_name: string
          id?: string
          result?: Json | null
          status: string
          updated_at?: string | null
        }
        Update: {
          ai_constraints?: string | null
          ai_prompt?: string
          api_set_id?: string
          created_at?: string | null
          created_by?: string
          field_name?: string
          id?: string
          result?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_data_api_set_id_fkey"
            columns: ["api_set_id"]
            isOneToOne: false
            referencedRelation: "api_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      api_sets: {
        Row: {
          api_secret: string | null
          created_at: string | null
          description: string | null
          headers: Json
          id: string
          name: string
          schema: Json
          status: Database["public"]["Enums"]["api_set_status"]
          subdomain: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["api_set_visibility"]
        }
        Insert: {
          api_secret?: string | null
          created_at?: string | null
          description?: string | null
          headers?: Json
          id?: string
          name: string
          schema?: Json
          status?: Database["public"]["Enums"]["api_set_status"]
          subdomain?: string | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["api_set_visibility"]
        }
        Update: {
          api_secret?: string | null
          created_at?: string | null
          description?: string | null
          headers?: Json
          id?: string
          name?: string
          schema?: Json
          status?: Database["public"]["Enums"]["api_set_status"]
          subdomain?: string | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["api_set_visibility"]
        }
        Relationships: []
      }
      api_sets_data: {
        Row: {
          api_set_id: string
          created_at: string | null
          data: Json
          id: number
          updated_at: string | null
        }
        Insert: {
          api_set_id: string
          created_at?: string | null
          data: Json
          id?: never
          updated_at?: string | null
        }
        Update: {
          api_set_id?: string
          created_at?: string | null
          data?: Json
          id?: never
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_sets_data_api_set_id_fkey"
            columns: ["api_set_id"]
            isOneToOne: false
            referencedRelation: "api_sets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      merge_update_jsonb:
        | {
            Args: {
              column_name: string
              object: Json
              row_id: number
              table_name: string
            }
            Returns: Json
          }
        | {
            Args: { object: Json; path: string[]; target: Json }
            Returns: Json
          }
    }
    Enums: {
      api_set_status:
        | "active"
        | "inactive"
        | "draft"
        | "archived"
        | "processing"
      api_set_visibility: "public" | "private"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      api_set_status: ["active", "inactive", "draft", "archived", "processing"],
      api_set_visibility: ["public", "private"],
    },
  },
} as const

