// content.config.ts
import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // "content" is just a name you’ll use when querying.
    content: defineCollection({
      // Treat each .md file as a page
      type: 'page',
      // Grab every Markdown file in content/ and its subfolders
      source: '**/*.md'
    })
  }
})
