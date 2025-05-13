import React, { useEffect, useState } from "react";
import axios from "axios";
import './AdminPage.css';

const BACKEND_URL = "https://bilshow-backend.onrender.com"; // bytt ved deploy

export default function AdminPage() {
  const [results, setResults] = useState([]);
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authorized) return;

    const fetchResults = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/results`, {
          headers: {
            Authorization: `Bearer ${password}`,
          },
        });
        console.log("✅ Resultatdata:", res.data);
        setResults(res.data);
      } catch (err) {
        console.error("Feil ved henting av resultater", err);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [authorized, password]);

  const handleResetVotes = async () => {
    if (!window.confirm("Er du sikker på at du vil slette alle stemmer?")) return;

    try {
      const res = await axios.post(
        `${BACKEND_URL}/reset-votes`,
        {},
        {
          headers: {
            Authorization: `Bearer ${password}`,
          },
        }
      );
      alert("✅ Stemmer nullstilt! Versjon: " + res.data.newVersion);
      setResults([]);
    } catch (err) {
      console.error("Kunne ikke nullstille stemmer:", err);
      alert("❌ Feil: " + (err.response?.data?.error || "Ukjent feil"));
    }
  };

  if (!authorized) {
    const handleSubmit = (e) => {
      e.preventDefault();
      setAuthorized(true);
    };

    return (
      <div className="admin-container">
        <h2 className="admin-title">Logg inn som admin</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="password"
            className="admin-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin-passord"
          />
          <button type="submit" className="admin-button">Logg inn</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2 className="admin-title">Resultater</h2>

      {results.length === 0 ? (
        <p>Ingen stemmer registrert enda.</p>
      ) : (
        <table className="results-table">
          <thead>
            <tr>
              <th>Bil</th>
              <th>Stemmer</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.votes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        className="admin-button"
        style={{ marginTop: "2rem", backgroundColor: "#c00" }}
        onClick={handleResetVotes}
      >
        🗑 Nullstill alle stemmer
      </button>
    </div>
  );
}
