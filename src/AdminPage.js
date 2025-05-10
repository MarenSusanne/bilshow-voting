import React, { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://bilshow-backend.onrender.com"; // bytt ved deploy

export default function AdminPage() {
  const [results, setResults] = useState([]);
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!authorized) return;

    const fetchResults = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/results`, {
          headers: {
            Authorization: `Bearer ${password}`,
          },
        });
        setResults(res.data);
      } catch (err) {
        console.error("Feil ved henting av resultater", err);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [authorized, password]);

  if (!authorized) {
  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthorized(true);
  };

  return (
    <div>
      <h2>Logg inn som admin</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Admin-passord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <button type="submit">Logg inn</button>
      </form>
    </div>
  );
}


  return (
    <div>
      <h1>Live Resultater</h1>
      <a href="/">Tilbake til stemming</a>
      <ul>
        {results.map((r, index) => (
          <li key={index}>
            <strong>{r.name}:</strong> {r.votes} stemmer
          </li>
        ))}
      </ul>
    </div>
  );
}
