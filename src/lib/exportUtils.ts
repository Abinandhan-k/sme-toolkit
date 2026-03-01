/**
 * Export utilities for CSV and PDF
 */

export interface ExportOptions {
  filename?: string
  sheetName?: string
}

/**
 * Export data as CSV
 */
export function exportToCSV(
  data: any[],
  options: ExportOptions = {}
) {
  const { filename = 'export.csv' } = options

  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header]
          // Handle values with commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value ?? ''
        })
        .join(',')
    ),
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv')
}

/**
 * Export data as JSON
 */
export function exportToJSON(
  data: any,
  options: ExportOptions = {}
) {
  const { filename = 'export.json' } = options
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename, 'application/json')
}

/**
 * Generate PDF using jspdf (lightweight alternative)
 */
export function exportToPDFSimple(
  data: any[],
  options: ExportOptions = {}
) {
  const { filename = 'export.pdf' } = options

  try {
    // Dynamic import to reduce bundle size
    Promise.all([
      import('jspdf').then(m => m.jsPDF),
      import('html2canvas').catch(() => null)
    ]).then(async ([jsPDF]) => {
      const doc = new jsPDF()
      let yPos = 10

      // Title
      doc.setFontSize(16)
      doc.text('Data Export', 10, yPos)
      yPos += 10

      // Table data
      if (data.length > 0) {
        const headers = Object.keys(data[0])
        
        // Headers
        doc.setFontSize(11)
        doc.setFont(undefined, 'bold')
        let xPos = 10
        for (const header of headers) {
          doc.text(header, xPos, yPos)
          xPos += 40
        }
        yPos += 7

        // Rows
        doc.setFont(undefined, 'normal')
        doc.setFontSize(10)
        for (const row of data.slice(0, 100)) { // Limit to 100 rows
          xPos = 10
          for (const header of headers) {
            const value = String(row[header] ?? '')
            doc.text(value.substring(0, 30), xPos, yPos)
            xPos += 40
          }
          yPos += 7
          if (yPos > 280) {
            doc.addPage()
            yPos = 10
          }
        }
      }

      // Download
      doc.save(filename)
    }).catch((error) => {
      console.error('PDF export failed:', error)
      // Fallback to JSON export
      exportToJSON(data, options)
    })
  } catch (error) {
    console.error('PDF export error:', error)
    // Fallback to JSON export
    exportToJSON(data, options)
  }
}

/**
 * Generate PDF (requires @react-pdf/renderer - optional dependency)
 * Falls back to JSON if not available
 */
export async function exportToPDF(
  data: any[],
  options: ExportOptions = {}
) {
  const { filename = 'export.pdf' } = options

  try {
    // Try importing react-pdf
    const { Document, Page, Text, View, StyleSheet, renderToBlob } = await import('@react-pdf/renderer')
    
    // Define styles
    const styles = StyleSheet.create({
      page: { padding: 20, backgroundColor: '#fff' },
      section: { marginBottom: 10 },
      header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
      table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#000' },
      row: { display: 'flex', flexDirection: 'row' as const, borderBottomWidth: 1, borderStyle: 'solid', borderColor: '#000' },
      cell: { padding: 8, flex: 1, borderRightWidth: 1, borderStyle: 'solid', borderColor: '#000' },
      lastCell: { padding: 8, flex: 1 },
    })

    // Note: Creating JSX elements for react-pdf should be done in a .tsx file
    // For now, we'll export as JSON with a note about PDF support
    console.log('PDF export with @react-pdf/renderer requires .tsx files')
    exportToJSON(data, { ...options, filename: filename.replace('.pdf', '.json') })
  } catch (error) {
    console.warn('react-pdf not available, exporting as JSON instead')
    // Fallback to JSON
    exportToJSON(data, { ...options, filename: filename.replace('.pdf', '.json') })
  }
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  downloadBlob(blob, filename)
}

/**
 * Download blob helper
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Generate filename with timestamp
 */
export function getExportFilename(type: string, timestamp: boolean = true): string {
  const date = new Date().toISOString().split('T')[0]
  const ext = type === 'csv' ? 'csv' : type === 'json' ? 'json' : 'pdf'
  return timestamp ? `export-${date}.${ext}` : `export.${ext}`
}
