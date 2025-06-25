import { Node } from '@tiptap/core'

export interface EmbedOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { url: string, title?: string }) => ReturnType
    }
  }
}

export const EmbedExtension = Node.create<EmbedOptions>({
  name: 'embed',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'embed-wrapper',
      },
    }
  },

  addAttributes() {
    return {
      url: {
        default: null,
      },
      title: {
        default: 'Embedded Content',
      },
      embedType: {
        default: 'iframe',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-embed]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const { url, title, embedType } = node.attrs

    if (!url) {
      return ['div', { class: 'embed-error' }, 'No embed URL provided']
    }

    // YouTube embed
    if (embedType === 'youtube') {
      return [
        'div',
        {
          class: 'embed-wrapper youtube-embed',
          'data-embed': 'true',
          ...HTMLAttributes
        },
        [
          'iframe',
          {
            src: url,
            title: title,
            frameborder: '0',
            allowfullscreen: 'true',
            width: '100%',
            height: '315',
            style: 'aspect-ratio: 16/9;'
          }
        ]
      ]
    }

    // Loom embed with responsive wrapper
    if (embedType === 'loom') {
      return [
        'div',
        {
          class: 'embed-wrapper loom-embed',
          'data-embed': 'true',
          ...HTMLAttributes
        },
        [
          'div',
          {
            style: 'position: relative; padding-bottom: 28.125%; height: 0;'
          },
          [
            'iframe',
            {
              src: url,
              title: title,
              frameborder: '0',
              webkitallowfullscreen: 'true',
              mozallowfullscreen: 'true',
              allowfullscreen: 'true',
              style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
            }
          ]
        ]
      ]
    }

    // Default iframe embed
    return [
      'div',
      {
        class: 'embed-wrapper iframe-embed',
        'data-embed': 'true',
        ...HTMLAttributes
      },
      [
        'div',
        { class: 'embed-header' },
        ['span', { class: 'embed-title' }, title],
        ['a', { href: url, target: '_blank', class: 'embed-link' }, '🔗']
      ],
      [
        'iframe',
        {
          src: url,
          title: title,
          frameborder: '0',
          width: '100%',
          height: '400',
          loading: 'lazy'
        }
      ]
    ]
  },

  addCommands() {
    return {
      setEmbed: (options) => ({ commands }) => {
        const { url, title = 'Embedded Content' } = options

        // Basic URL validation
        if (!url || !url.startsWith('http')) {
          return false
        }

        // Detect embed type
        let embedType = 'iframe'
        let processedUrl = url

        // YouTube detection and conversion
        if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
          embedType = 'youtube'
          processedUrl = convertToYouTubeEmbed(url)
        }
        // Loom detection and conversion
        else if (url.includes('loom.com/share/') || url.includes('loom.com/embed/')) {
          embedType = 'loom'
          processedUrl = convertToLoomEmbed(url)
        }

        return commands.insertContent({
          type: this.name,
          attrs: {
            url: processedUrl,
            title,
            embedType
          }
        })
      }
    }
  }
})

// Helper function to convert YouTube URLs to embed format
function convertToYouTubeEmbed(url: string): string {
  try {
    const urlObj = new URL(url)

    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v')
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1)
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }
  } catch (error) {
    console.warn('Failed to convert YouTube URL:', error)
  }

  return url
}

// Helper function to convert Loom URLs to embed format
function convertToLoomEmbed(url: string): string {
  try {
    const urlObj = new URL(url)

    if (urlObj.hostname.includes('loom.com')) {
      // Handle both share and embed URLs
      if (url.includes('/share/')) {
        // Convert share URL to embed URL
        const videoId = urlObj.pathname.split('/share/')[1]
        if (videoId) {
          // Preserve any query parameters (like sid)
          const searchParams = urlObj.search
          return `https://www.loom.com/embed/${videoId}${searchParams}`
        }
      } else if (url.includes('/embed/')) {
        // Already an embed URL, return as is
        return url
      }
    }
  } catch (error) {
    console.warn('Failed to convert Loom URL:', error)
  }

  return url
}

export default EmbedExtension
