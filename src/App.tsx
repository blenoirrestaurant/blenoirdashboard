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

interface VirementResume {
  source: string;
  count: number;
  total: number;
}

export default function App() {
  const [csvData, setCsvData] = useState<Virement[]>([]);
  const [pdfFiles, setPdfFiles] = useState<GoogleDriveFile[]>([]);
  const [resume, setResume] = useState<VirementResume[]>([]);

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

  function analyserTextePDF(contenu: string) {
    const lignes = contenu.split('\n');
    const sources = ['SUNDAY', 'MARKET PAY', 'DELIVEROO', 'EDENRED', 'UP COOP', 'PLUXEE', 'REGLEMENT AFFILIES BI'];
    const resultats: Record<string, { total: number; count: number }> = {};

    lignes.forEach((ligne) => {
      for (const source of sources) {
        if (ligne.toUpperCase().includes(source)) {
          const montantMatch = ligne.match(/([0-9]+,[0-9]{2})\s*$/);
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

    const resume: VirementResume[] = Object.entries(resultats).map(([source, { total, count }]) => ({
      source,
      count,
      total,
    }));

    setResume(resume);
  }

  const total = csvData.reduce((sum, entry) => sum + (entry.montant || 0), 0);

  // Simulation : texte collé manuellement (remplacer par lecture réelle plus tard)
  useEffect(() => {
    const texteExtrait = `DATE VOS OPERATIONS EXO VALEUR DEBIT CREDIT\n11/01/24.VIR SEPA SUNDAY 11/01 448,01\n12/01/24.VIR SEPA MARKET PAY 12/01 88,97\n12/01/24.VIR SEPA SUNDAY 12/01 290,09\n15/01/24.VIR SEPA MARKET PAY 15/01 966,08\n15/01/24.VIR SEPA MARKET PAY 15/01 2242,08\n15/01/24.VIR SEPA SUNDAY 15/01 560,04\n16/01/24.VIR SEPA MARKET PAY 16/01 897,37\n16/01/24.VIR SEPA SUNDAY 16/01 487,39\n17/01/24.VIR SEPA MARKET PAY 17/01 647,63\n17/01/24.VIR SEPA SUNDAY 17/01 1007,71\n17/01/24.VIR SEPA SUNDAY 17/01 826,28\n17/01/24.VIR SEPA SUNDAY 17/01 139,02\n18/01/24.VIR SEPA MARKET PAY 18/01 649,55\n18/01/24.VIR SEPA SUNDAY 18/01 224,61\n19/01/24.VIR SEPA SUNDAY 19/01 244,87\n22/01/24.VIR SEPA MARKET PAY 22/01 2992,53\n22/01/24.VIR SEPA MARKET PAY 22/01 781,44\n23/01/24.VIR SEPA MARKET PAY 23/01 392,17\n23/01/24.VIR SEPA SUNDAY 23/01 611,58\n24/01/24.VIR SEPA UP COOP 24/01 14,21\n24/01/24.VIR SEPA SUNDAY 24/01 1246,37\n24/01/24.VIR SEPA SUNDAY 24/01 991,70\n24/01/24.VIR SEPA SUNDAY 24/01 603,63\n25/01/24.VIR SEPA MARKET PAY 25/01 583,04\n25/01/24.VIR SEPA SUNDAY 25/01 569,19\n26/01/24.VIR SEPA MARKET PAY 26/01 893,50\n26/01/24.VIR SEPA SUNDAY 26/01 546,23\n29/01/24.VIR SEPA MARKET PAY 29/01 2963,21\n29/01/24.VIR SEPA MARKET PAY 29/01 1382,96\n29/01/24.VIR SEPA SUNDAY 29/01 533,58\n30/01/24.VIR SEPA EDENRED FRANCE 30/01 380,95\n30/01/24.VIR SEPA MARKET PAY 30/01 958,21\n30/01/24.VIR SEPA SUNDAY 30/01 313,48\n31/01/24.VIR SEPA MARKET PAY 31/01 530,54\n31/01/24.VIR SEPA SUNDAY 31/01 1549,61\n31/01/24.VIR SEPA SUNDAY 31/01 1384,61\n31/01/24.VIR SEPA SUNDAY 31/01 275,24`;
    analyserTextePDF(texteExtrait);
  }, []);

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

      {resume.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>📊 Résumé des encaissements détectés (Janvier 2024)</h2>
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Source</th>
                <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Nb virements</th>
                <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Total (€)</th>
              </tr>
            </thead>
            <tbody>
              {resume.map((r, i) => (
                <tr key={i}>
                  <td>{r.source}</td>
                  <td style={{ textAlign: 'right' }}>{r.count}</td>
                  <td style={{ textAlign: 'right' }}>{r.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
