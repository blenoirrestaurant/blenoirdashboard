import { useEffect, useState } from 'react'

type Transaction = {
  date: string
  libelle: string
  montant: number
  source?: string
}

export default function App() {
  const [csvData, setCsvData] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [pdfFiles, setPdfFiles] = useState<string[]>([])

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter((line) => line.trim() !== '')
      const data = lines.slice(1).map((line) => {
        const [date, libelle, montant] = line.split(',')
        return {
          date,
          libelle,
          montant: parseFloat(montant),
        }
      })
      setCsvData(data)
      setTotal(data.reduce((sum, row) => sum + row.montant, 0))
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    const folderId = '1TLCbDHSLcpj38OM3FbYFF1heJF9t9maW'
    if (!apiKey) return

    fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/pdf'&key=${apiKey}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setPdfFiles(data.files.map((file: any) => file.name))
        }
      })
      .catch((err) => {
        console.error('Erreur de récupération Drive :', err)
      })
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Import virements (CSV)</h1>

      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <p style={{ marginTop: '1rem' }}>
        <strong>Total importé :</strong>{' '}
        {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
      </p>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '1rem',
        }}
      >
        <thead>
          <tr>
            <th
              style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}
            >
              Date
            </th>
            <th
              style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}
            >
              Libellé
            </th>
            <th
              style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}
            >
              Montant (€)
            </th>
          </tr>
        </thead>
        <tbody>
          {csvData.map((row, index) => (
            <tr key={index}>
              <td>{row.date}</td>
              <td>{row.libelle}</td>
              <td style={{ textAlign: 'right' }}>
                {row.montant.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '3rem' }}>
        <h2>📄 Relevés bancaires disponibles (Google Drive)</h2>
        {pdfFiles.length === 0 ? (
          <p>Aucun fichier PDF trouvé ou clé API manquante.</p>
        ) : (
          <ul>
            {pdfFiles.map((file, idx) => (
              <li key={idx}>{file}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
