import { useEffect, useState } from 'react';
import './App.css';

type CsvRow = {
  date: string;
  libelle: string;
  montant: number;
};

type PdfFile = {
  name: string;
  url: string;
};

export default function App() {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [total, setTotal] = useState(0);
  const [sources, setSources] = useState<Record<string, number>>({});

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim() !== '');
      const data = lines.slice(1).map((line) => {
        const [date, libelle, montant] = line.split(';');
        return {
          date,
          libelle,
          montant: parseFloat(montant?.replace(',', '.')),
        };
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  }

  useEffect(() => {
    const total = csvData.reduce((acc, row) => acc + (isNaN(row.montant) ? 0 : row.montant), 0);
    setTotal(total);

    const counts: Record<string, number> = {};
    csvData.forEach((row) => {
      const lower = row.libelle.toLowerCase();
      let label = 'Autre';

      if (lower.includes('sunday')) label = 'Sunday';
      else if (lower.includes('market pay')) label = 'Market Pay';
      else if (lower.includes('deliveroo')) label = 'Deliveroo';
      else if (lower.includes('uber')) label = 'Uber';
      else if (lower.includes('pluxee')) label = 'Pluxee';
      else if (lower.includes('règlement affiliés') || lower.includes('reglement affiliés')) label = 'Affiliés BI';

      counts[label] = (counts[label] || 0) + row.montant;
    });

    setSources(counts);
  }, [csvData]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const folderId = '1TLCbDHSLcpj38OM3FbYFF1heJF9t9maW';

    if (!apiKey) return;

    fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/pdf'&key=${apiKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setPdfFiles(
            data.files.map((file: any) => ({
              name: file.name,
              url: `https://drive.google.com/file/d/${file.id}/view`,
            }))
          );
        }
      })
      .catch(() => setPdfFiles([]));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📥 Import virements (CSV)</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <p><strong>Total importé</strong> : {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>

      <table style={{ width: '100%', marginTop: '2rem' }}>
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
              <td style={{ textAlign: 'right' }}>
                {row.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '3rem' }}>
        <h2>📊 Répartition par source</h2>
        <ul>
          {Object.entries(sources).map(([label, amount]) => (
            <li key={label}>
              <strong>{label}</strong> : {amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>📄 Relevés bancaires disponibles (Google Drive)</h2>
        {pdfFiles.length === 0 ? (
          <p>Aucun fichier PDF trouvé ou clé API manquante.</p>
        ) : (
          <ul>
            {pdfFiles.map((file, index) => (
              <li key={index}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
