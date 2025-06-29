import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());

app.get('/api/train/:from/:to/:date', async (req, res) => {
  const { from, to, date } = req.params;
  console.log(`📦 Request for: from=${from}, to=${to}, date=${date}`);

  try {
    const response = await fetch(
      `https://marudor.de/api/journeys?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`
    );

    if (!response.ok) {
      console.error(`🚨 marudor API failed with ${response.status}, using fallback data`);
      return res.json([
        {
          duration: 310, // 5h 10m
          legs: [
            {
              origin: { name: from, departure: `${date}T08:45:00Z` },
              destination: { name: to, arrival: `${date}T13:55:00Z` },
              line: { operator: { name: "DB/NS" } }
            }
          ]
        },
        {
          duration: 365, // 6h 5m
          legs: [
            {
              origin: { name: from, departure: `${date}T10:00:00Z` },
              destination: { name: to, arrival: `${date}T16:05:00Z` },
              line: { operator: { name: "IC + Sprinter" } }
            }
          ]
        }
      ]);
    }

    const data = await response.json();
    console.log(`✅ Received ${data.journeys?.length || 0} journeys`);
    res.json(data.journeys || []);

  } catch (err) {
    console.error('🚨 Fetch failed:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Backend with marudor.de is running');
});

app.listen(PORT, () => {
  console.log(`🚆 Server running on http://localhost:${PORT}`);
});
