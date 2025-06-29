import { useState } from 'react'
import './App.css'

function App() {
  const [tripType, setTripType] = useState('one-way');
  const [from, setFrom] = useState('Hamburg Hbf');
  const [to, setTo] = useState('Amsterdam Centraal');
  const [date, setDate] = useState('2025-07-01');
  const [nights, setNights] = useState(2);

  const [outData, setOutData] = useState([]);
  const [inData, setInData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0,10);
  };

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutData([]);
    setInData([]);

    try {
      const res1 = await fetch(`https://smart-train-backend.onrender.com/api/train/...`);
      const data1 = await res1.json();
      setOutData(data1);

      if (tripType === 'roundtrip') {
        const returnDate = addDays(date, nights);
        const res2 = await fetch(`https://smart-train-backend.onrender.com/api/train/...`);
        const data2 = await res2.json();
        setInData(data2);
      }
    } catch {
      setError('Fetch failed');
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <h1>🚆 Smart Train Finder</h1>
      <form onSubmit={search} className="trip-form">
  <label>
    Trip Type:
    <select value={tripType} onChange={(e) => setTripType(e.target.value)}>
      <option>one-way</option>
      <option>roundtrip</option>
    </select>
  </label>
  <label>
    From:
    <input value={from} onChange={(e) => setFrom(e.target.value)} />
  </label>
  <label>
    To:
    <input value={to} onChange={(e) => setTo(e.target.value)} />
  </label>
  <label>
    Date:
    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
  </label>
  {tripType === 'roundtrip' && (
    <label>
      Stay:
      <input 
        type="number" min="1"
        value={nights}
        onChange={(e) => setNights(parseInt(e.target.value) || 1)}
        style={{ width: '60px', marginLeft: '5px' }}
      /> nights
    </label>
  )}
  <button>Find Trains</button>
</form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {outData.length > 0 && <div>
        <h2>Outbound: {from} → {to} on {date}</h2>
        <table>
          <thead>
            <tr><th>Duration</th><th>Dep</th><th>Arr</th><th>Changes</th><th>Operator</th></tr>
          </thead>
          <tbody>
            {outData.map((j, i) => (
              <tr key={i}>
                <td>{Math.floor(j.duration/60)}h {j.duration%60}m</td>
                <td>{j.legs[0].origin.name} ({j.legs[0].departure?.slice(11,16)})</td>
                <td>{j.legs.at(-1).destination.name} ({j.legs.at(-1).arrival?.slice(11,16)})</td>
                <td>{j.legs.length-1}</td>
                <td>{j.legs[0].line?.operator?.name || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}

      {inData.length > 0 && <div>
        <h2>Return: {to} → {from} on {addDays(date, nights)}</h2>
        <table>
          <thead>
            <tr><th>Duration</th><th>Dep</th><th>Arr</th><th>Changes</th><th>Operator</th></tr>
          </thead>
          <tbody>
            {inData.map((j, i) => (
              <tr key={i}>
                <td>{Math.floor(j.duration/60)}h {j.duration%60}m</td>
                <td>{j.legs[0].origin.name} ({j.legs[0].departure?.slice(11,16)})</td>
                <td>{j.legs.at(-1).destination.name} ({j.legs.at(-1).arrival?.slice(11,16)})</td>
                <td>{j.legs.length-1}</td>
                <td>{j.legs[0].line?.operator?.name || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  )
}

export default App
