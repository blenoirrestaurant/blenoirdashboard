import { useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Upload } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './components/ui/table';

export default function App() {
  const [csvData, setCsvData] = useState<
    { date: string; libelle: string; montant: number }[]
  >([]);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim() !== '');
      const data = lines.slice(1).map((line) => {
        const [date, libelle, montant] = line.split(',');
        return {
          date,
          libelle,
          montant: parseFloat(montant.replace(',', '.'))
        };
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  }

  const total = csvData.reduce((sum, row) => sum + row.montant, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Import virements (CSV)</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      <p className="mt-4 font-semibold">Total importé : {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>

      <Table className="mt-6 w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
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
                  currency: 'EUR'
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
