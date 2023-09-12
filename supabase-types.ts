export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mind_maps: {
        Row: {
          collaborators: string | null
          content: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: number
          published: boolean | null
          title: string | null
        }
        Insert: {
          collaborators?: string | null
          content?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: number
          published?: boolean | null
          title?: string | null
        }
        Update: {
          collaborators?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: number
          published?: boolean | null
          title?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          bio: string | null
          created_by: string
          email: string | null
          id: number
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_by: string
          email?: string | null
          id?: number
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_by?: string
          email?: string | null
          id?: number
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
