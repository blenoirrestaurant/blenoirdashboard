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
