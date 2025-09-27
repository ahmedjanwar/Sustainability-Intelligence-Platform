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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          actionable: boolean | null
          category: string | null
          confidence_score: number | null
          created_at: string | null
          dataset_id: string | null
          generated_at: string | null
          id: string
          insight_text: string
          model_version: string | null
          priority: Database["public"]["Enums"]["insight_priority"] | null
        }
        Insert: {
          actionable?: boolean | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          dataset_id?: string | null
          generated_at?: string | null
          id?: string
          insight_text: string
          model_version?: string | null
          priority?: Database["public"]["Enums"]["insight_priority"] | null
        }
        Update: {
          actionable?: boolean | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          dataset_id?: string | null
          generated_at?: string | null
          id?: string
          insight_text?: string
          model_version?: string | null
          priority?: Database["public"]["Enums"]["insight_priority"] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          action_description: string | null
          action_title: string
          co2_reduction_kg: number | null
          created_at: string | null
          dataset_id: string | null
          generated_at: string | null
          id: string
          implementation_effort: string | null
          insight_id: string | null
          payback_period_months: number | null
          potential_savings_eur: number | null
          priority: Database["public"]["Enums"]["insight_priority"] | null
        }
        Insert: {
          action_description?: string | null
          action_title: string
          co2_reduction_kg?: number | null
          created_at?: string | null
          dataset_id?: string | null
          generated_at?: string | null
          id?: string
          implementation_effort?: string | null
          insight_id?: string | null
          payback_period_months?: number | null
          potential_savings_eur?: number | null
          priority?: Database["public"]["Enums"]["insight_priority"] | null
        }
        Update: {
          action_description?: string | null
          action_title?: string
          co2_reduction_kg?: number | null
          created_at?: string | null
          dataset_id?: string | null
          generated_at?: string | null
          id?: string
          implementation_effort?: string | null
          insight_id?: string | null
          payback_period_months?: number | null
          potential_savings_eur?: number | null
          priority?: Database["public"]["Enums"]["insight_priority"] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "ai_insights"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          key_value: string
          last_used: string | null
          service: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          key_value: string
          last_used?: string | null
          service: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          key_value?: string
          last_used?: string | null
          service?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      co2_emissions_table: {
        Row: {
          Agriculture: number | null
          Buildings: number | null
          Category: number | null
          "Fuel Exploitation": number | null
          "Industrial Combustion": number | null
          "Power Industry": number | null
          Processes: number | null
          "Total CO2/cap": number | null
          Transport: number | null
          Waste: number | null
        }
        Insert: {
          Agriculture?: number | null
          Buildings?: number | null
          Category?: number | null
          "Fuel Exploitation"?: number | null
          "Industrial Combustion"?: number | null
          "Power Industry"?: number | null
          Processes?: number | null
          "Total CO2/cap"?: number | null
          Transport?: number | null
          Waste?: number | null
        }
        Update: {
          Agriculture?: number | null
          Buildings?: number | null
          Category?: number | null
          "Fuel Exploitation"?: number | null
          "Industrial Combustion"?: number | null
          "Power Industry"?: number | null
          Processes?: number | null
          "Total CO2/cap"?: number | null
          Transport?: number | null
          Waste?: number | null
        }
        Relationships: []
      }
      dashboard_data: {
        Row: {
          data: Json
          data_type: string
          dataset_id: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
        }
        Insert: {
          data: Json
          data_type: string
          dataset_id?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
        }
        Update: {
          data?: Json
          data_type?: string
          dataset_id?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_data_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_data: {
        Row: {
          created_at: string | null
          data: Json
          dataset_id: string | null
          id: string
          row_number: number
        }
        Insert: {
          created_at?: string | null
          data: Json
          dataset_id?: string | null
          id?: string
          row_number: number
        }
        Update: {
          created_at?: string | null
          data?: Json
          dataset_id?: string | null
          id?: string
          row_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "dataset_data_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          columns: Json | null
          created_at: string | null
          error_message: string | null
          file_size_mb: number | null
          file_type: string | null
          filename: string
          id: string
          original_filename: string
          processed_at: string | null
          rows_count: number | null
          sample_data: Json | null
          source_type: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["dataset_status"] | null
          summary_stats: Json | null
          updated_at: string | null
          upload_progress: number | null
        }
        Insert: {
          columns?: Json | null
          created_at?: string | null
          error_message?: string | null
          file_size_mb?: number | null
          file_type?: string | null
          filename: string
          id?: string
          original_filename: string
          processed_at?: string | null
          rows_count?: number | null
          sample_data?: Json | null
          source_type?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["dataset_status"] | null
          summary_stats?: Json | null
          updated_at?: string | null
          upload_progress?: number | null
        }
        Update: {
          columns?: Json | null
          created_at?: string | null
          error_message?: string | null
          file_size_mb?: number | null
          file_type?: string | null
          filename?: string
          id?: string
          original_filename?: string
          processed_at?: string | null
          rows_count?: number | null
          sample_data?: Json | null
          source_type?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["dataset_status"] | null
          summary_stats?: Json | null
          updated_at?: string | null
          upload_progress?: number | null
        }
        Relationships: []
      }
      ml_predictions: {
        Row: {
          accuracy_score: number | null
          confidence_scores: Json | null
          created_at: string | null
          dataset_id: string | null
          generated_at: string | null
          id: string
          model_version: string | null
          prediction_type: Database["public"]["Enums"]["prediction_type"]
          predictions: Json
          scenario: string | null
          time_horizon: string
        }
        Insert: {
          accuracy_score?: number | null
          confidence_scores?: Json | null
          created_at?: string | null
          dataset_id?: string | null
          generated_at?: string | null
          id?: string
          model_version?: string | null
          prediction_type: Database["public"]["Enums"]["prediction_type"]
          predictions: Json
          scenario?: string | null
          time_horizon: string
        }
        Update: {
          accuracy_score?: number | null
          confidence_scores?: Json | null
          created_at?: string | null
          dataset_id?: string | null
          generated_at?: string | null
          id?: string
          model_version?: string | null
          prediction_type?: Database["public"]["Enums"]["prediction_type"]
          predictions?: Json
          scenario?: string | null
          time_horizon?: string
        }
        Relationships: [
          {
            foreignKeyName: "ml_predictions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_training_jobs: {
        Row: {
          accuracy_score: number | null
          completed_at: string | null
          created_at: string | null
          datasets: string[]
          error_message: string | null
          id: string
          job_id: string
          model_type: string
          parameters: Json | null
          started_at: string | null
          status: string | null
          training_duration_minutes: number | null
        }
        Insert: {
          accuracy_score?: number | null
          completed_at?: string | null
          created_at?: string | null
          datasets: string[]
          error_message?: string | null
          id?: string
          job_id: string
          model_type: string
          parameters?: Json | null
          started_at?: string | null
          status?: string | null
          training_duration_minutes?: number | null
        }
        Update: {
          accuracy_score?: number | null
          completed_at?: string | null
          created_at?: string | null
          datasets?: string[]
          error_message?: string | null
          id?: string
          job_id?: string
          model_type?: string
          parameters?: Json | null
          started_at?: string | null
          status?: string | null
          training_duration_minutes?: number | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          dataset_id: string | null
          description: string | null
          download_count: number | null
          expires_at: string | null
          file_path: string | null
          file_size_mb: number | null
          generated_at: string | null
          id: string
          include_charts: boolean | null
          language: string | null
          report_type: string
          title: string
        }
        Insert: {
          created_at?: string | null
          dataset_id?: string | null
          description?: string | null
          download_count?: number | null
          expires_at?: string | null
          file_path?: string | null
          file_size_mb?: number | null
          generated_at?: string | null
          id?: string
          include_charts?: boolean | null
          language?: string | null
          report_type: string
          title: string
        }
        Update: {
          created_at?: string | null
          dataset_id?: string | null
          description?: string | null
          download_count?: number | null
          expires_at?: string | null
          file_path?: string | null
          file_size_mb?: number | null
          generated_at?: string | null
          id?: string
          include_charts?: boolean | null
          language?: string | null
          report_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      sustainability_metrics: {
        Row: {
          additional_metrics: Json | null
          calculated_at: string | null
          carbon_footprint: number | null
          carbon_intensity: number | null
          co2_emissions_kg: number | null
          created_at: string | null
          dataset_id: string | null
          efficiency_rating: string | null
          emissions_reduction: number | null
          energy_efficiency: number | null
          id: string
          renewable_energy_mwh: number | null
          renewable_share: number | null
          sustainability_score: number | null
          total_energy_mwh: number | null
        }
        Insert: {
          additional_metrics?: Json | null
          calculated_at?: string | null
          carbon_footprint?: number | null
          carbon_intensity?: number | null
          co2_emissions_kg?: number | null
          created_at?: string | null
          dataset_id?: string | null
          efficiency_rating?: string | null
          emissions_reduction?: number | null
          energy_efficiency?: number | null
          id?: string
          renewable_energy_mwh?: number | null
          renewable_share?: number | null
          sustainability_score?: number | null
          total_energy_mwh?: number | null
        }
        Update: {
          additional_metrics?: Json | null
          calculated_at?: string | null
          carbon_footprint?: number | null
          carbon_intensity?: number | null
          co2_emissions_kg?: number | null
          created_at?: string | null
          dataset_id?: string | null
          efficiency_rating?: string | null
          emissions_reduction?: number | null
          energy_efficiency?: number | null
          id?: string
          renewable_energy_mwh?: number | null
          renewable_share?: number | null
          sustainability_score?: number | null
          total_energy_mwh?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sustainability_metrics_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      sustainability_table: {
        Row: {
          CO2_Emissions_kg: number | null
          Electricity_Generation_MWh: number | null
          Energy_Consumption_kWh: number | null
          Facility: string | null
          Fleet_EV_Percentage: number | null
          Heat_Generation_MWh: number | null
          Recycled_Waste_Percentage: number | null
          Region: string | null
          Renewable_Energy_Percentage: number | null
          Supplier: string | null
          Timestamp: string | null
          Waste_Generated_kg: number | null
          Water_Usage_Liters: number | null
        }
        Insert: {
          CO2_Emissions_kg?: number | null
          Electricity_Generation_MWh?: number | null
          Energy_Consumption_kWh?: number | null
          Facility?: string | null
          Fleet_EV_Percentage?: number | null
          Heat_Generation_MWh?: number | null
          Recycled_Waste_Percentage?: number | null
          Region?: string | null
          Renewable_Energy_Percentage?: number | null
          Supplier?: string | null
          Timestamp?: string | null
          Waste_Generated_kg?: number | null
          Water_Usage_Liters?: number | null
        }
        Update: {
          CO2_Emissions_kg?: number | null
          Electricity_Generation_MWh?: number | null
          Energy_Consumption_kWh?: number | null
          Facility?: string | null
          Fleet_EV_Percentage?: number | null
          Heat_Generation_MWh?: number | null
          Recycled_Waste_Percentage?: number | null
          Region?: string | null
          Renewable_Energy_Percentage?: number | null
          Supplier?: string | null
          Timestamp?: string | null
          Waste_Generated_kg?: number | null
          Water_Usage_Liters?: number | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      dataset_status: "uploading" | "processing" | "processed" | "failed"
      insight_priority: "low" | "medium" | "high" | "critical"
      prediction_type:
        | "emissions"
        | "efficiency"
        | "renewable_share"
        | "comprehensive"
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
      dataset_status: ["uploading", "processing", "processed", "failed"],
      insight_priority: ["low", "medium", "high", "critical"],
      prediction_type: [
        "emissions",
        "efficiency",
        "renewable_share",
        "comprehensive",
      ],
    },
  },
} as const
