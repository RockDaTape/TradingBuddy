export type Json = string|number|boolean|null|{[key:string]:Json}|Json[]
export interface Database {
  public: {
    Tables: {
      rules: {
        Row:    { id: string; content: string }
        Insert: { content: string }
        Update: { content?: string }
      }
    }
    Views: {}; Functions: {}; Enums: {}; CompositeTypes:{}
  }
}

