import fs from 'node:fs'
import path from 'node:path'

const routes = [
  'about','causes','projects','impact','governance','advisory','partners','resources',
  'news','events','volunteer','donate','contact','gallery','focal-points','lab','safehome','join'
]
const source = path.resolve('dist/index.html')
if (!fs.existsSync(source)) throw new Error('dist/index.html is missing')
const html = fs.readFileSync(source, 'utf8')
for (const route of routes) {
  const dir = path.resolve('dist', route)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
}
console.log('Generated direct static routes:', routes.join(', '))
