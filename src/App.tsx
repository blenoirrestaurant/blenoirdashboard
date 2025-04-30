import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function App() {
  const [csvData, setCsvData] = useState<{ date: string; libelle: string; montant: number }[]>([]);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim() !== '');
      const data = lines.slice(1).map((line) => {
        const [date, libelle, montant] = line.split(';');
        return {
          date: date.trim(),
          libelle: libelle.trim(),
          montant: parseFloat(montant.replace(',', '.')),
        };
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  }

  const total = csvData.reduce((sum, entry) => sum + (entry.montant || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Import virements (CSV)</h1>
        <label className="inline-flex items-center cursor-pointer">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <Button variant="outline" className="flex items-center gap-2">
            <Upload size={16} /> Importer un fichier
          </Button>
        </label>
      </div>

      <Card className="rounded-2xl shadow">
        <CardContent className="p-4">
          <p className="text-muted-foreground text-sm">Total importé</p>
          <p className="text-xl font-semibold">
            {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </CardContent>
      </Card>

      {csvData.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-medium mb-4">Détails des virements</h2>
          <Table>
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
                      currency: 'EUR',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
