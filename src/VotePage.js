import React, { useEffect, useState } from "react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const BACKEND_URL = "http://localhost:3001"; // bytt ved deploy

export default function VotePage() {
  const [contestants, setContestants] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("hasVoted")) {
      setHasVoted(true);
    }

    axios
      .get("https://din-supabase-url.supabase.co/rest/v1/contestants", {
        headers: {
          apikey: "DIN_ANON_KEY",
          Authorization: "Bearer DIN_ANON_KEY",
        },
      })
      .then((res) => setContestants(res.data))
      .catch((err) => console.error("Feil ved henting av biler", err));
  }, []);

  const sendVote = async (contestantId) => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprint = result.visitorId;

    const ipRes = await axios.get("https://api64.ipify.org?format=json");
    const ipAddress = ipRes.data.ip;

    try {
      await axios.post(`${BACKEND_URL}/vote`, {
        contestantId,
        fingerprint,
        ipAddress,
      });

      localStorage.setItem("hasVoted", "true");
      setHasVoted(true);
    } catch (err) {
      alert("Du har allerede stemt eller noe gikk galt.");
    }
  };

  return (
    <div>
      <h1>Stem på din favorittbil</h1>
        <a href="/admin">Gå til admin</a>

      {hasVoted && (
        <div style={{ background: "#def", padding: "1rem", marginBottom: "1rem" }}>
          <strong>Takk for at du stemte!</strong>
        </div>
      )}

      {contestants.map((c) => (
        <div key={c.id} style={{ marginBottom: "2rem" }}>
          <h2>{c.name}</h2>
          {c.photo_url && <img src={c.photo_url} alt={c.name} width="200" />}
          <br />
          {!hasVoted && (
            <button onClick={() => sendVote(c.id)}>Stem</button>
          )}
        </div>
      ))}
    </div>
  );
}
