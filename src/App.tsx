import { useState } from 'react';

interface Virement {
  date: string;
  libelle: string;
  montant: number;
}

export default function App() {
  const [csvData, setCsvData] = useState<Virement[]>([]);

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
    </div>
  );
}
