import React, { useState } from "react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import './VotePage.css';

const BACKEND_URL = "https://bilshow-backend.onrender.com"; // endre til riktig backend-URL

export default function VotePage() {
  const [carName, setCarName] = useState("");
  const [hasVoted, setHasVoted] = useState(localStorage.getItem("hasVoted"));
  const [message, setMessage] = useState("");
  React.useEffect(() => {
  if (hasVoted && !message) {
    setMessage("Takk for stemmen!");
  }
}, [hasVoted, message]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprint = result.visitorId;

    const ipRes = await axios.get("https://api64.ipify.org?format=json");
    const ipAddress = ipRes.data.ip;

    try {
      await axios.post(`${BACKEND_URL}/vote`, {
        carName,
        fingerprint,
        ipAddress,
      });

      localStorage.setItem("hasVoted", "true");
      setHasVoted(true);
      setMessage("Takk for stemmen!");
    } catch (err) {
      setMessage("Noe gikk galt: " + (err.response?.data?.error || "Ukjent feil"));
    }
  };

  return (
  <div className="vote-container">
    <img src="/logo.png" alt="Modified logo" className="vote-logo" />
    <h1 className="vote-title">Stem på din favorittbil</h1>
    <p className="vote-desc">Skriv inn bilnavnet og send inn stemmen din. Du kan kun stemme én gang.</p>

    {hasVoted ? (
      <div className="vote-thankyou">{message}</div>
    ) : (
      <form onSubmit={handleSubmit} className="vote-form">
        <input
          type="text"
          value={carName}
          onChange={(e) => setCarName(e.target.value)}
          placeholder="F.eks. Ford Mustang"
          required
          className="vote-input"
        />
        <button type="submit" className="vote-button">Stem</button>
      </form>
    )}

    {/* Test-knapp – kun synlig i utvikling */}
    {process.env.NODE_ENV === "development" && (
      <button
        onClick={() => {
          localStorage.removeItem("hasVoted");
          window.location.reload();
        }}
        style={{
          marginTop: "2rem",
          backgroundColor: "#ccc",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
        }}
      >
        🔄 Tilbakestill stemme
      </button>
    )}
  </div>
);
}