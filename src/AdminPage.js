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

  const simulateVotes = async (count = 100) => {
  const carNames = [
    "BMW M3", "Audi A4", "Ford Mustang", "Tesla Model 3", "Volvo XC60", "Porsche 911",
    "Volkswagen Golf", "Toyota Supra", "Chevrolet Camaro", "Nissan 350Z",
    "Mazda MX-5", "Lamborghini Aventador", "Ferrari F8", "Kia EV6", "Hyundai Ioniq 5",
    "Peugeot 208", "Renault Clio", "Skoda Octavia", "Mercedes C200", "Opel Astra",
    "Honda Civic", "Subaru Impreza", "Alfa Romeo Giulia", "Dodge Challenger", "Jeep Wrangler",
    "Range Rover Evoque", "Mini Cooper", "Citroën C3", "Suzuki Swift", "Mitsubishi Lancer",
    "Bugatti Chiron", "Koenigsegg Jesko", "BMW i8", "Tesla Model S", "Tesla Cybertruck",
    "Ford F-150", "Ram 1500", "Toyota Hilux", "Audi RS6", "Mercedes G-Wagon",
    "Lexus RX", "Volvo V90", "Polestar 2", "Fiat 500", "Mazda CX-5", "Toyota Corolla",
    "Honda Accord", "Seat Leon", "Cupra Born", "DS 4"
  ];

  const variations = (name) => [
    name,
    name.toLowerCase(),
    name.toUpperCase(),
    ` ${name} `,
    name.replace(" ", "").toLowerCase(),
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  ];

  for (let i = 0; i < count; i++) {
    const baseName = carNames[Math.floor(Math.random() * carNames.length)];
    const variantList = variations(baseName);
    const carName = variantList[Math.floor(Math.random() * variantList.length)];

    const fakeFingerprint = `sim-${Math.random().toString(36).slice(2, 10)}`;
    const fakeIP = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    try {
      await axios.post(`${BACKEND_URL}/vote`, {
        carName,
        fingerprint: fakeFingerprint,
        ipAddress: fakeIP
      });

      console.log(`✅ Simulert stemme ${i + 1}:`, carName);
    } catch (err) {
      console.error(`❌ Feil på stemme ${i + 1}:`, err.response?.data?.error || err.message);
    }
  }

  alert(`🎉 Ferdig! Simulerte ${count} stemmer.`);
};



  if (!authorized) {
    const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.get(`${BACKEND_URL}/results`, {
      headers: {
        Authorization: `Bearer ${password}`,
      },
    });
    setAuthorized(true);
    setError("");
  } catch (err) {
    console.error("Feil passord:", err);
    setError("Ugyldig passord");
  }
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
        style={{ marginTop: "1rem", backgroundColor: "#0077aa" }}
        onClick={() => simulateVotes(120)}
      >
        🧪 Simuler 20 stemmer
      </button>
      <button
        className="admin-button"
        style={{ marginTop: "1rem", backgroundColor: "#444" }}
        onClick={async () => {
          if (!window.confirm("Slå sammen like bilnavn og rydde databasen?")) return;
          try {
            const res = await axios.post(`${BACKEND_URL}/merge-contestants`, {}, {
              headers: {
                Authorization: `Bearer ${password}`
              }
            });
            alert("✅ " + res.data.message);
          } catch (err) {
            alert("❌ Klarte ikke slå sammen: " + (err.response?.data?.error || err.message));
          }
        }}
      >
        🧹 Slå sammen duplikater
      </button>
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
