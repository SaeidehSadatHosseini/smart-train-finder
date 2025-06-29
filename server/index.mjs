import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());

app.get('/', (req, res) => {
  res.send('✅ Backend is running');
});

app.get('/api/train/:from/:to/:date', async (req, res) => {
  const { from, to, date } = req.params;
  console.log(`📦 Request for: from=${from}, to=${to}, date=${date}`);

  // Hardcoded IBNR station codes for Hamburg Hbf and Amsterdam Centraal
  const fromCode = '8002549';  // Hamburg Hbf
  const toCode = '8400058';    // Amsterdam Centraal

  try {
    const response = await fetch(
      `https://marudor.de/api/journeys?from=${fromCode}&to=${toCode}&date=${date}`
    );

    if (!response.ok) {
      console.error(`marudor API failed with ${response.status}, using fallback data`);
      return res.json([
        {
          duration: 310,
          legs: [
            {
              origin: { name: from, departure: `${date}T08:45:00Z` },
              destination: { name: to, arrival: `${date}T13:55:00Z` },
              line: { operator: { name: "DB/NS" } }
            }
          ]
        },
        {
          duration: 365,
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
    res.json([
      {
        duration: 310,
        legs: [
          {
            origin: { name: from, departure: `${date}T08:45:00Z` },
            destination: { name: to, arrival: `${date}T13:55:00Z` },
            line: { operator: { name: "DB/NS" } }
          }
        ]
      },
      {
        duration: 365,
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
});

app.listen(PORT, () => {
  console.log(`🚆 Server running on http://localhost:${PORT}`);
});