import { ref, onMounted } from 'vue'
import type { Database } from '~/app/types/supabase'

const DEFAULT_CONTENT = `
<h1>Trading Rules</h1>
<p>Use this page to document your daily trading rules and guidelines. Having clear, written rules helps maintain discipline and consistency in your trading approach.</p>

<h2>Example Rules:</h2>
<ul>
  <li><strong>Risk Management:</strong> Never risk more than 2% of account per trade</li>
  <li><strong>Entry Criteria:</strong> Only enter trades that meet your setup requirements</li>
  <li><strong>Exit Strategy:</strong> Always have a predefined exit plan before entering</li>
  <li><strong>Market Hours:</strong> Define when you will and won't trade</li>
  <li><strong>Daily Limits:</strong> Set maximum number of trades or loss limits per day</li>
</ul>

<p><em>Delete this content and replace with your own trading rules.</em></p>
`.trim()

export function useRules() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const content = ref<string>('')
  const id = ref<string|null>(null)
  const isLoaded = ref(false)

  onMounted(async () => {
    // Debug: Check if user is authenticated
    console.log('Current user:', user.value)
    console.log('User session:', await supabase.auth.getSession())

    const { data, error } = await supabase
      .from('Rules')
      .select('id, content')
      .single()

    console.log('rules fetch:', { data, error })

    if (!error && data) {
      id.value = data.id
      content.value = data.content || DEFAULT_CONTENT
    } else {
      // No rules exist yet - set default content
      content.value = DEFAULT_CONTENT
    }

    isLoaded.value = true
  })

  async function save(html: string) {
    const payload = { content: html === '<p></p>' ? '' : html }
    if (id.value) {
      await supabase.from('Rules').update(payload).eq('id', id.value)
    } else {
      const { data, error } = await supabase
        .from('Rules')
        .insert(payload)
        .select('id')
        .single()
      if (!error && data) id.value = data.id
    }
  }

  return { content, save, isLoaded }
}
