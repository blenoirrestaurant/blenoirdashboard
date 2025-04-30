import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload } from "lucide-react";

export default function App() {
  const [csvData, setCsvData] = useState<{
    source: string;
    montant: number;
  }[]>([]);

  const [total, setTotal] = useState(0);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim() !== '');

      const data = lines.map((line) => {
        const fields = line.split(',');
        const libelle = line.toLowerCase();

        let source = 'Autre';
        if (libelle.includes('sunday')) source = 'Sunday';
        else if (libelle.includes('market pay')) source = 'Market Pay';
        else if (libelle.includes('deliveroo')) source = 'Deliveroo';
        else if (libelle.includes('uber')) source = 'Uber';
        else if (libelle.includes('pluxee france')) source = 'Pluxee France';
        else if (libelle.includes('affiliés bi')) source = 'Règlement Affiliés BI';

        const montantStr = fields.find(f => f.match(/\d+[\.,]?\d*/));
        const montant = montantStr ? parseFloat(montantStr.replace(',', '.')) : 0;

        return { source, montant };
      });

      setCsvData(data);

      const totalImporte = data.reduce((acc, row) => acc + row.montant, 0);
      setTotal(totalImporte);
    };

    reader.readAsText(file);
  }

  const groupedData = csvData.reduce((acc, row) => {
    if (!acc[row.source]) {
      acc[row.source] = { montant: 0, count: 0 };
    }
    acc[row.source].montant += row.montant;
    acc[row.source].count += 1;
    return acc;
  }, {} as Record<string, { montant: number; count: number }>);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Import virements (CSV)</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <p className="mt-4 font-medium">Total importé : {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Totaux par source</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Montant total (€)</TableHead>
            <TableHead>Nombre de virements</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedData).map(([source, { montant, count }]) => (
            <TableRow key={source}>
              <TableCell>{source}</TableCell>
              <TableCell>{montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</TableCell>
              <TableCell>{count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
