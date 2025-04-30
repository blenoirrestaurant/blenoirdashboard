import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function App() {
  const [csvData, setCsvData] = useState<{ date: string; libelle: string; montant: number }[]>([]);
  const [pdfResultats, setPdfResultats] = useState<{ [key: string]: { total: number; count: number } }>({});

  const sources = [
    'SUNDAY',
    'MARKET PAY',
    'EDENRED',
    'UP COOP',
    'PLUXEE FRANCE',
    'REGLEMENT AFFILIES BI',
    'DELIVEROO',
    'UBER'
  ];

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim() !== '');
      const data = lines.slice(1).map((line) => {
        const [date, libelle, montantStr] = line.split(',');
        return {
          date,
          libelle,
          montant: parseFloat(montantStr),
        };
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  }

  useEffect(() => {
    async function fetchPDFs() {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const folderId = '1TLCbDHSLcpj38OM3FbYFF1heJF9t9maW';

      if (!apiKey) return;

      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/pdf'&key=${apiKey}`
      );
      const data = await res.json();

      const resultats: { [key: string]: { total: number; count: number } } = {};

      for (const file of data.files) {
        const exportUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain&key=${apiKey}`;
        const pdfRes = await fetch(exportUrl);
        const texte = await pdfRes.text();
        const lignes = texte.split('\n');

        lignes.forEach((ligne) => {
          const ligneUpper = ligne.toUpperCase();

          for (const source of sources) {
            console.log("🔍 Ligne analysée :", ligne);
            console.log("→ Source cherchée :", source);
            console.log("→ Est-ce que ça match ?", ligneUpper.includes(source));

            if (ligneUpper.includes(source)) {
              const montantMatch = ligne.match(/([0-9]+,[0-9]{2})(?!.*[0-9]+,[0-9]{2})/);

              if (montantMatch) {
                const montant = parseFloat(montantMatch[1].replace(',', '.'));
                if (!resultats[source]) {
                  resultats[source] = { total: 0, count: 0 };
                }
                resultats[source].total += montant;
                resultats[source].count += 1;
              }
            }
          }
        });
      }

      setPdfResultats(resultats);
    }

    fetchPDFs();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Import virements (CSV)</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" />
      <p className="mb-2 font-semibold">
        Total importé :{' '}
        {csvData.reduce((sum, row) => sum + row.montant, 0).toLocaleString('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        })}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date / ID</TableHead>
            <TableHead>Libellé</TableHead>
            <TableHead className="text-right">Montant (€)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {csvData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.libelle}</TableCell>
              <TableCell className="text-right">
                {row.montant.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">📄 Relevés bancaires disponibles (Google Drive)</h2>
        {Object.keys(pdfResultats).length > 0 ? (
          <ul className="list-disc ml-5">
            {Object.entries(pdfResultats).map(([source, { total, count }]) => (
              <li key={source}>
                {source} : {count} virements pour{' '}
                {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </li>
            ))}
          </ul>
        ) : (
          <p>• Aucun fichier PDF trouvé ou clé API manquante.</p>
        )}
      </div>
    </div>
  );
}
