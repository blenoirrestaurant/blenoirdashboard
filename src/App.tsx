import { useEffect, useState } from 'react';

export default function App() {
  const [csvData, setCsvData] = useState<{ date: string; libelle: string; montant: number }[]>([]);
  const [pdfFiles, setPdfFiles] = useState<string[]>([]);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim() !== '');
      const data = lines.slice(1).map((line) => {
        const [date, libelle, montantStr] = line.split(',');
        const montant = parseFloat(montantStr?.replace(',', '.') || '0');
        return { date, libelle, montant };
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  }

  const total = csvData.reduce((sum, row) => sum + row.montant, 0);

  useEffect(() => {
    async function fetchPdfFiles() {
      try {
        const folderId = '1TLCbDHSLcpj38OM3FbYFF1heJF9t9maW';
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

        if (!apiKey) {
          setPdfFiles([]);
          return;
        }

        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/pdf'&key=${apiKey}`
        );

        const result = await response.json();

        if (result.files) {
          setPdfFiles(result.files.map((file: any) => file.name));
        } else {
          setPdfFiles([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des fichiers PDF :', error);
        setPdfFiles([]);
      }
    }

    fetchPdfFiles();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Import virements (CSV)</h1>

      <input type="file" accept=".csv" onChange={handleFileUpload} />

      <h3 style={{ marginTop: '1rem' }}>Total importé : {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</h3>

      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Libellé</th>
            <th style={{ textAlign: 'right' }}>Montant (€)</th>
          </tr>
        </thead>
        <tbody>
          {csvData.map((row, index) => (
            <tr key={index}>
              <td>{row.date}</td>
              <td>{row.libelle}</td>
              <td style={{ textAlign: 'right' }}>{row.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
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
  );
}
