import React, { useState } from "react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const BACKEND_URL = "https://din-backend-url.onrender.com";

export default function VotePage() {
  const [input, setInput] = useState("");
  const [hasVoted, setHasVoted] = useState(localStorage.getItem("hasVoted"));
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprint = result.visitorId;

    const ipRes = await axios.get("https://api64.ipify.org?format=json");
    const ipAddress = ipRes.data.ip;

    try {
      await axios.post(`${BACKEND_URL}/vote`, {
        carName: input,
        fingerprint,
        ipAddress,
      });

      localStorage.setItem("hasVoted", "true");
      setHasVoted(true);
      setMessage("Takk for din stemme!");
    } catch (err) {
      setMessage("Noe gikk galt: " + (err.response?.data?.error || "Ukjent feil"));
    }
  };

  return (
    <div>
      <h1>Stem på din favorittbil</h1>
      {hasVoted ? (
        <p>{message || "Du har allerede stemt."}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Skriv inn bilnavn (f.eks. Ford Mustang)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
          <button type="submit">Stem</button>
        </form>
      )}
    </div>
  );
}
