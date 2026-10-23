// Genereret fra Supabase-skemaet. Opdateres når databasen ændres.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_admin: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          is_admin?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_admin?: boolean
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string
          city: string
          city_slug: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          slug: string
          website: string | null
        }
        Insert: {
          address: string
          city: string
          city_slug: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          slug: string
          website?: string | null
        }
        Update: {
          address?: string
          city?: string
          city_slug?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          slug?: string
          website?: string | null
        }
        Relationships: []
      }
      review_photos: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          position: number
          review_id: string
          storage_path: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          review_id: string
          storage_path: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          review_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_photos_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author_id: string | null
          body: string | null
          burger_name: string | null
          created_at: string
          id: string
          price_kr: number | null
          restaurant_id: string
          score_bun: number | null
          score_overall: number
          score_patty: number | null
          score_price: number | null
          score_sides: number | null
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          visited_on: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author_id?: string | null
          body?: string | null
          burger_name?: string | null
          created_at?: string
          id?: string
          price_kr?: number | null
          restaurant_id: string
          score_bun?: number | null
          score_overall: number
          score_patty?: number | null
          score_price?: number | null
          score_sides?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          visited_on?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author_id?: string | null
          body?: string | null
          burger_name?: string | null
          created_at?: string
          id?: string
          price_kr?: number | null
          restaurant_id?: string
          score_bun?: number | null
          score_overall?: number
          score_patty?: number | null
          score_price?: number | null
          score_sides?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          visited_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      restaurant_stats: {
        Row: {
          avg_bun: number | null
          avg_overall: number | null
          avg_patty: number | null
          avg_price: number | null
          avg_sides: number | null
          city: string | null
          city_slug: string | null
          last_reviewed_at: string | null
          lat: number | null
          lng: number | null
          name: string | null
          restaurant_id: string | null
          review_count: number | null
          slug: string | null
          typical_price_kr: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      review_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])> =
  (PublicSchema["Tables"] & PublicSchema["Views"])[T] extends { Row: infer R } ? R : never
