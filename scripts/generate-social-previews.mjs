import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://evescm.org'
const API = process.env.VITE_SUPABASE_URL || 'https://mozwkfyiaqxwaoxwpkry.supabase.co'
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_UhbESgvWxdswVun3Vo5uvw_xk0SvpPF'
const FALLBACK_IMAGE = `${SITE}/media/gallery/image-1.jpeg`

const esc = (value = '') => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const cleanText = (value = '') => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
const absoluteUrl = (value = '') => {
  const raw = String(value || '').trim()
  if (!raw) return FALLBACK_IMAGE
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw)
      if (url.hostname === 'evescm.org' && /\/gallery\/image-[123]\.jpeg$/i.test(url.pathname)) {
        return `${SITE}/media/gallery/${url.pathname.split('/').pop()}`
      }
      return url.href
    } catch { return FALLBACK_IMAGE }
  }
  const clean = raw.replace(/^\/+/, '')
  if (/^gallery\/image-[123]\.jpeg$/i.test(clean)) return `${SITE}/media/${clean}`
  return `${SITE}/${clean}`
}
const replaceMeta = (html, pattern, replacement) => pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `  ${replacement}\n  </head>`)
const meta = (html, attribute, key, content) => {
  const escaped = esc(content)
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, 'i')
  const tag = `<meta ${attribute}="${key}" content="${escaped}" />`
  return replaceMeta(html, pattern, tag)
}
const linkTag = (html, rel, href) => {
  const pattern = new RegExp(`<link\\s+rel=["']${rel}["'][^>]*>`, 'i')
  return replaceMeta(html, pattern, `<link rel="${rel}" href="${esc(href)}" />`)
}

if (!fs.existsSync('dist/index.html')) throw new Error('dist/index.html is missing; build the site first')
const endpoint = `${API}/rest/v1/eves_cms_news?select=slug,title_fr,title_en,excerpt_fr,excerpt_en,body_fr,body_en,category,published_at,updated_at,featured_image,seo_title_fr,seo_title_en,seo_description_fr,seo_description_en,seo_keywords,tags,metadata,status&status=eq.published&order=published_at.desc`
const response = await fetch(endpoint, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } })
if (!response.ok) throw new Error(`Could not fetch published EVES articles for social previews: HTTP ${response.status} ${await response.text()}`)
const articles = await response.json()
const baseHtml = fs.readFileSync(path.resolve('dist/index.html'), 'utf8')
let generated = 0

for (const article of articles) {
  const slug = String(article.slug || '').trim()
  if (!slug || slug.includes('/') || slug === '.' || slug === '..') continue
  const url = `${SITE}/news/${encodeURIComponent(slug)}`
  const title = cleanText(article.seo_title_fr || article.title_fr || article.title_en || 'Actualités EVES')
  const description = cleanText(article.seo_description_fr || article.excerpt_fr || article.excerpt_en || article.body_fr || article.body_en).slice(0, 300)
  const image = absoluteUrl(article.featured_image)
  const published = article.published_at ? new Date(article.published_at).toISOString() : undefined
  const modified = article.updated_at ? new Date(article.updated_at).toISOString() : published
  const tags = [...new Set([...(Array.isArray(article.tags) ? article.tags : []), ...(Array.isArray(article.seo_keywords) ? article.seo_keywords : [])].map(cleanText).filter(Boolean))]
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    image: [image],
    mainEntityOfPage: url,
    url,
    publisher: { '@type': 'Organization', name: 'EVES', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/logo.svg` } },
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    ...(article.category ? { articleSection: cleanText(article.category) } : {}),
    ...(tags.length ? { keywords: tags.join(', ') } : {})
  }
  let html = baseHtml
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)} | EVES</title>`)
  html = meta(html, 'name', 'description', description)
  html = linkTag(html, 'canonical', url)
  html = meta(html, 'property', 'og:type', 'article')
  html = meta(html, 'property', 'og:site_name', 'EVES')
  html = meta(html, 'property', 'og:title', title)
  html = meta(html, 'property', 'og:description', description)
  html = meta(html, 'property', 'og:url', url)
  html = meta(html, 'property', 'og:image', image)
  html = meta(html, 'property', 'og:image:secure_url', image)
  html = meta(html, 'property', 'og:image:alt', title)
  html = meta(html, 'property', 'og:image:type', /\.png(?:$|\?)/i.test(image) ? 'image/png' : /\.webp(?:$|\?)/i.test(image) ? 'image/webp' : 'image/jpeg')
  html = meta(html, 'property', 'og:locale', 'fr_CM')
  html = meta(html, 'name', 'twitter:card', 'summary_large_image')
  html = meta(html, 'name', 'twitter:title', title)
  html = meta(html, 'name', 'twitter:description', description)
  html = meta(html, 'name', 'twitter:image', image)
  html = meta(html, 'name', 'twitter:image:alt', title)
  html = meta(html, 'property', 'article:published_time', published || '')
  html = meta(html, 'property', 'article:modified_time', modified || '')
  html = meta(html, 'property', 'article:section', cleanText(article.category || 'EVES'))
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">\n${JSON.stringify(schema).replace(/</g, '\\u003c')}\n</script>`)
  const dir = path.resolve('dist/news', slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
  generated++
}
console.log(`Generated unique Open Graph, Twitter and NewsArticle metadata for ${generated} published EVES articles.`)
