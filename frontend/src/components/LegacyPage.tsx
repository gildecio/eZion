import React, { useEffect, useRef } from 'react'
import initLegacyWidgets from '../utils/legacyInit'

type Props = {
  url: string
  replaceBody?: boolean
}

// Client-side: fetch a static HTML from `public` and inject body content
// Also re-executes scripts found in the fetched HTML so legacy behavior works.
export default function LegacyPage({ url, replaceBody }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(url)
        const text = await res.text()

        if (cancelled) return

        // Extract head and body (capture body attributes too)
        const headMatch = text.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
        const bodyTagMatch = text.match(/<body([^>]*)>([\s\S]*?)<\/body>/i)
        const bodyAttrs = bodyTagMatch ? bodyTagMatch[1] : ''
        const bodyHtml = bodyTagMatch ? bodyTagMatch[2] : text

        // Inject head nodes (styles, meta, scripts in head) into document.head if not present
        if (headMatch && !cancelled) {
          const headHtml = headMatch[1]
          const temp = document.createElement('div')
          temp.innerHTML = headHtml
          // Move children to document.head if not duplicate
          Array.from(temp.children).forEach((node) => {
            try {
              if (node.tagName.toLowerCase() === 'link') {
                const href = (node as HTMLLinkElement).getAttribute('href')
                if (href && !document.head.querySelector(`link[href="${href}"]`)) {
                  document.head.appendChild(node)
                }
              } else if (node.tagName.toLowerCase() === 'script') {
                const src = (node as HTMLScriptElement).getAttribute('src')
                if (src) {
                  if (!document.head.querySelector(`script[src="${src}"]`)) {
                    const s = document.createElement('script')
                    s.src = src
                    s.async = false
                    document.head.appendChild(s)
                  }
                } else {
                  // inline script in head
                  const inline = node.textContent || ''
                  const exists = Array.from(document.head.querySelectorAll('script')).some((s) => s.textContent === inline)
                  if (!exists) {
                    const s = document.createElement('script')
                    s.text = inline
                    document.head.appendChild(s)
                  }
                }
              } else if (node.tagName.toLowerCase() === 'style') {
                document.head.appendChild(node)
              } else if (node.tagName.toLowerCase() === 'meta' || node.tagName.toLowerCase() === 'title') {
                // append meta/title (may duplicate)
                document.head.appendChild(node)
              } else {
                // append other head nodes if needed
                document.head.appendChild(node)
              }
            } catch (e) {
              // ignore node move errors
            }
          })
        }

        if (replaceBody && !cancelled) {
          try {
            // apply attributes like class, id, data-* to document.body
            const attrRegex = /([a-zA-Z0-9-_:]+)=(?:"([^"]*)"|'([^']*)')/g
            let m: RegExpExecArray | null
            while ((m = attrRegex.exec(bodyAttrs)) !== null) {
              const name = m[1]
              const value = m[2] ?? m[3] ?? ''
              try { document.body.setAttribute(name, value) } catch (e) { }
            }

            // replace body HTML entirely to match the original page
            document.body.innerHTML = bodyHtml

            // execute scripts in body
            const scripts = Array.from(document.body.querySelectorAll('script'))
            scripts.forEach((oldScript) => {
              const newScript = document.createElement('script')
              for (let i = 0; i < oldScript.attributes.length; i++) {
                const attr = oldScript.attributes[i]
                newScript.setAttribute(attr.name, attr.value)
              }
              if (oldScript.src) {
                newScript.src = oldScript.src
                newScript.async = false
              } else {
                newScript.text = oldScript.innerHTML
              }
              oldScript.parentNode?.replaceChild(newScript, oldScript)
            })
            // After executing body scripts, dispatch a synthetic load event
            // so legacy listeners registered on window.load will run.
            try {
              setTimeout(() => {
                window.dispatchEvent(new Event('load'))
                // initialize legacy widgets (charts, sparklines, pies)
                try { initLegacyWidgets() } catch (e) { /* ignore */ }
              }, 50)
            } catch (e) {
              // ignore
            }
          } catch (e) {
            // ignore
          }
        } else if (containerRef.current) {
          containerRef.current.innerHTML = bodyHtml

          // Find scripts in the injected HTML and re-run them
          const scripts = Array.from(containerRef.current.querySelectorAll('script'))
          scripts.forEach((oldScript) => {
            const newScript = document.createElement('script')
            // copy attributes
            for (let i = 0; i < oldScript.attributes.length; i++) {
              const attr = oldScript.attributes[i]
              newScript.setAttribute(attr.name, attr.value)
            }
            if (oldScript.src) {
              newScript.src = oldScript.src
              newScript.async = false
            } else {
              newScript.text = oldScript.innerHTML
            }
            oldScript.parentNode?.replaceChild(newScript, oldScript)
          })
          // If the legacy page added a window.load listener for hiding a loader,
          // that listener may have been registered after the real window.load event
          // (since we're injecting HTML client-side). Ensure the loader is hidden
          // to avoid an eternal "loading" state.
          try {
            const loaderEl = document.getElementById('loader')
            if (loaderEl && !loaderEl.classList.contains('fadeOut')) {
              // small delay so any injected scripts can run first
              setTimeout(() => {
                loaderEl.classList.add('fadeOut')
                // remove loader from DOM after transition (safety)
                setTimeout(() => {
                  try { loaderEl.parentNode?.removeChild(loaderEl) } catch (e) { /* ignore */ }
                }, 900)
                // initialize legacy widgets after DOM injection
                try { initLegacyWidgets() } catch (e) { /* ignore */ }
              }, 300)
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = `<div class="p-20">Erro ao carregar: ${err}</div>`
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [url])

  return <div ref={containerRef} />
}
