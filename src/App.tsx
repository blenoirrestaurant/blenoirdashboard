
import { useState } from 'react';

export default function App() {
  const [message] = useState("Bienvenue sur le dashboard Blé Noir !");
  return (
    <div style={{ padding: 40 }}>
      <h1>{message}</h1>
      <p>Interface de test à déployer sur Vercel.</p>
    </div>
  );
}
