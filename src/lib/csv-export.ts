export function downloadCSV(data: any[], filename: string) {
  if (!data || !data.length) return

  // Filter out any complex objects or functions, keep only primitives
  const sanitize = (val: any) => {
    if (val === null || val === undefined) return ''
    if (typeof val === 'object') return '' // Skip nested objects
    // Escape quotes and wrap in quotes to handle commas within text
    return `"${String(val).replace(/"/g, '""')}"`
  }

  const header = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object')
  
  const csv = [
    header.join(','), // header row first
    ...data.map(row => header.map(fieldName => sanitize(row[fieldName])).join(','))
  ].join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
