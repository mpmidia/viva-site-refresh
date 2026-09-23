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
      editions: {
        Row: {
          created_at: string
          data: string
          descricao: string
          id: string
          imagem_url: string | null
          imagens: string[]
          inscricao_url: string | null
          local: string
          participantes: number
          titulo: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          data: string
          descricao: string
          id?: string
          imagem_url?: string | null
          imagens?: string[]
          inscricao_url?: string | null
          local: string
          participantes?: number
          titulo: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          imagem_url?: string | null
          imagens?: string[]
          inscricao_url?: string | null
          local?: string
          participantes?: number
          titulo?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      next_edition: {
        Row: {
          capas: string[]
          cidade: string | null
          created_at: string
          data_evento: string | null
          data_fim: string | null
          id: string
          inscricoes_abertura: string | null
          inscricoes_encerramento: string | null
          locais: string[]
          logos_url: string | null
          possui_oficinas: boolean
          programacao_data: string | null
          regulamento_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          capas?: string[]
          cidade?: string | null
          created_at?: string
          data_evento?: string | null
          data_fim?: string | null
          id?: string
          inscricoes_abertura?: string | null
          inscricoes_encerramento?: string | null
          locais?: string[]
          logos_url?: string | null
          possui_oficinas?: boolean
          programacao_data?: string | null
          regulamento_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          capas?: string[]
          cidade?: string | null
          created_at?: string
          data_evento?: string | null
          data_fim?: string | null
          id?: string
          inscricoes_abertura?: string | null
          inscricoes_encerramento?: string | null
          locais?: string[]
          logos_url?: string | null
          possui_oficinas?: boolean
          programacao_data?: string | null
          regulamento_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          next_edition_id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          next_edition_id: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          next_edition_id?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "next_edition"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      program_attractions: {
        Row: {
          created_at: string
          data: string | null
          descricao: string
          horario: string | null
          id: string
          imagem_url: string | null
          local: string | null
          next_edition_id: string
          nome: string
          publicado: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string | null
          descricao?: string
          horario?: string | null
          id?: string
          imagem_url?: string | null
          local?: string | null
          next_edition_id: string
          nome: string
          publicado?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string | null
          descricao?: string
          horario?: string | null
          id?: string
          imagem_url?: string | null
          local?: string | null
          next_edition_id?: string
          nome?: string
          publicado?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_attractions_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "next_edition"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_categories: {
        Row: {
          created_at: string
          id: string
          next_edition_id: string
          nome: string
          ordem: number
          updated_at: string
          valor: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          next_edition_id: string
          nome: string
          ordem?: number
          updated_at?: string
          valor?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          next_edition_id?: string
          nome?: string
          ordem?: number
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_categories_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "next_edition"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_cities: {
        Row: {
          created_at: string
          id: string
          next_edition_id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          next_edition_id: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          next_edition_id?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_cities_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "next_edition"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          categoria: string
          cidade: string
          classificacao: string
          cpf: string
          created_at: string
          declaracoes: Json
          descricao_trabalho: string
          duracao_minutos: number | null
          email: string
          forma_cache: string
          fotos: string[]
          id: string
          next_edition_id: string
          nome_artistico: string
          oficina_descricao: string | null
          oficina_faixas: string[]
          oficina_materiais: string | null
          oficina_participantes: number | null
          oficina_titulo: string | null
          redes_sociais: string | null
          responsavel: string
          titulo_trabalho: string
          updated_at: string
          video_url: string | null
          whatsapp: string
        }
        Insert: {
          categoria: string
          cidade: string
          classificacao: string
          cpf: string
          created_at?: string
          declaracoes?: Json
          descricao_trabalho: string
          duracao_minutos?: number | null
          email: string
          forma_cache: string
          fotos?: string[]
          id?: string
          next_edition_id: string
          nome_artistico: string
          oficina_descricao?: string | null
          oficina_faixas?: string[]
          oficina_materiais?: string | null
          oficina_participantes?: number | null
          oficina_titulo?: string | null
          redes_sociais?: string | null
          responsavel: string
          titulo_trabalho: string
          updated_at?: string
          video_url?: string | null
          whatsapp: string
        }
        Update: {
          categoria?: string
          cidade?: string
          classificacao?: string
          cpf?: string
          created_at?: string
          declaracoes?: Json
          descricao_trabalho?: string
          duracao_minutos?: number | null
          email?: string
          forma_cache?: string
          fotos?: string[]
          id?: string
          next_edition_id?: string
          nome_artistico?: string
          oficina_descricao?: string | null
          oficina_faixas?: string[]
          oficina_materiais?: string | null
          oficina_participantes?: number | null
          oficina_titulo?: string | null
          redes_sociais?: string | null
          responsavel?: string
          titulo_trabalho?: string
          updated_at?: string
          video_url?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_next_edition_id_fkey"
            columns: ["next_edition_id"]
            isOneToOne: false
            referencedRelation: "next_edition"
            referencedColumns: ["id"]
          },
        ]
      }
      site_images: {
        Row: {
          chave: string
          created_at: string
          id: string
          rotulo: string
          updated_at: string
          url: string
        }
        Insert: {
          chave: string
          created_at?: string
          id?: string
          rotulo: string
          updated_at?: string
          url: string
        }
        Update: {
          chave?: string
          created_at?: string
          id?: string
          rotulo?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      sponsorship_settings: {
        Row: {
          created_at: string
          id: string
          midia_kit_path: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          midia_kit_path?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          midia_kit_path?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
