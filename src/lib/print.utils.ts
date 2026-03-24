/**
 * Print Utilities
 * Helper functions for printing functionality
 */

/**
 * Trigger browser print dialog for the entire page
 */
export function printPage() {
  window.print()
}

/**
 * Print a specific element by ID
 * Opens a new window with only that element's content
 */
export function printElement(elementId: string) {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`)
    return
  }

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    console.error('Failed to open print window')
    return
  }

  // Get all stylesheets from the current document
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n')
      } catch (e) {
        // External stylesheets might throw CORS errors
        return ''
      }
    })
    .join('\n')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          ${styles}

          /* Additional print-specific styles */
          @media print {
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: avoid;
            }

            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }

            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }

            h1, h2, h3 {
              page-break-after: avoid;
              margin-top: 0;
            }

            .no-print {
              display: none !important;
            }
          }

          @page {
            margin: 2cm;
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

/**
 * Generate print-friendly CSS for a component
 */
export const printStyles = `
  @media print {
    /* Hide non-essential elements */
    .no-print {
      display: none !important;
    }

    /* Show print-only elements */
    .print-only {
      display: block !important;
    }

    /* Page setup */
    @page {
      margin: 2cm;
      size: A4;
    }

    /* Body styles */
    body {
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
    }

    /* Headings */
    h1 {
      font-size: 18pt;
      margin-bottom: 0.5em;
    }

    h2 {
      font-size: 16pt;
      margin-bottom: 0.5em;
    }

    h3 {
      font-size: 14pt;
      margin-bottom: 0.5em;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: avoid;
      margin: 1em 0;
    }

    th, td {
      border: 1px solid #333;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #e0e0e0;
      font-weight: bold;
    }

    /* Prevent breaks */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }

    table, figure {
      page-break-inside: avoid;
    }

    /* Links */
    a {
      color: #000;
      text-decoration: underline;
    }

    /* Remove shadows and effects */
    * {
      box-shadow: none !important;
      text-shadow: none !important;
    }
  }
`
