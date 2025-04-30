import { useEffect, useState } from 'react';

interface Virement {
  date: string;
  libelle: string;
  montant: number;
}

interface GoogleDriveFile {
  name: string;
  url: string;
}

export default function App() {
  const [csvData, setCsvData] = useState<Virement[]>([]);
  const [pdfFiles, setPdfFiles] = useState<GoogleDriveFile[]>([]);

  useEffect(() => {
    async function fetchDriveFiles() {
      try {
        const res = await fetch(
          'https://www.googleapis.com/drive/v3/files?q=%271TLCbDHSLcpj38OM3FbYFF1heJF9t9maW%27+in+parents+and+mimeType%3D%27application%2Fpdf%27&key=AIzaSyD5vEpTMJNMt24JUxMjc9kbdlzYF6a4S4Y'
        );
        const json = await res.json();
        if (json.files) {
          setPdfFiles(
            json.files.map((f: any) => ({
              name: f.name,
              url: `https://drive.google.com/file/d/${f.id}/view`,
            }))
          );
        }
      } catch (err) {
        console.error('Erreur chargement fichiers PDF Drive:', err);
      }
    }
    fetchDriveFiles();
  }, []);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim() !== '');
      const headers = lines[0].split(';').map(h => h.replaceAll('"', '').trim().toLowerCase());
      const idxId = headers.findIndex(h => h.includes('id') || h.includes('date'));
      const idxNom = headers.findIndex(h => h.includes('nom') || h.includes('libell'));
      const idxMontant = headers.findIndex(h => h.includes('montant') || h.includes('amount'));
      const data: Virement[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(';').map(p => p.replaceAll('"', '').trim());
        if (!parts[idxMontant]) continue;
        const id = parts[idxId] || `Ligne ${i + 1}`;
        const nom = parts[idxNom] || '';
        const montantStr = parts[idxMontant]?.replace(',', '.').replace(/[^0-9.-]+/g, '') || '0';
        const montant = parseFloat(montantStr);
        if (!isNaN(montant)) {
          data.push({ date: id, libelle: nom, montant });
        }
      }
      setCsvData(data);
    };
    reader.readAsText(file);
  }

  const total = csvData.reduce((sum, entry) => sum + (entry.montant || 0), 0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Import virements (CSV)</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <div style={{ marginTop: '2rem' }}>
        <p><strong>Total importé :</strong> {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
      </div>

      {csvData.length > 0 && (
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Date / ID</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Libellé</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Montant (€)</th>
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, index) => (
              <tr key={index}>
                <td style={{ padding: '0.5rem 0' }}>{row.date}</td>
                <td>{row.libelle}</td>
                <td style={{ textAlign: 'right' }}>
                  {row.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: '3rem', fontSize: '1.25rem' }}>📄 Relevés bancaires disponibles (Google Drive)</h2>
      <ul style={{ marginTop: '1rem' }}>
        {pdfFiles.length > 0 ? (
          pdfFiles.map((file, i) => (
            <li key={i} style={{ marginBottom: '0.5rem' }}>
              <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
            </li>
          ))
        ) : (
          <li>Aucun fichier PDF trouvé ou clé API manquante.</li>
        )}
      </ul>
    </div>
  );
}
