import { ref, onMounted } from 'vue'
import type { Database } from '~/app/types/supabase'

export function useRules() {
  // Nuxt will auto-import this for you
  const supabase = useSupabaseClient<Database>()

  const content = ref<string>('')
  const id      = ref<string|null>(null)

  onMounted(async () => {
    const { data, error } = await supabase
      .from('rules')
      .select('id, content')
      .single()
    console.log('rules fetch:', { data, error })
    if (!error && data) {
      id.value      = data.id
      content.value = data.content
    }
  })

  async function save(html: string) {
    const payload = { content: html === '<p></p>' ? '' : html }
    if (id.value) {
      await supabase.from('rules').update(payload).eq('id', id.value)
    } else {
      const { data, error } = await supabase
        .from('rules')
        .insert(payload)
        .select('id')
        .single()
      if (!error && data) id.value = data.id
    }
  }

  return { content, save }
}
