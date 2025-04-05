const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;

const WINDOW_SIZE = 10;
let window = [];

const TEST_SERVER_URLS = {
  p: `http://20.244.56.144/evaluation-service/primes`,
  f: `http://20.244.56.144/evaluation-service/fibo`,
  e: `http://20.244.56.144/evaluation-service/even`,
  r: `http://20.244.56.144/evaluation-service/rand`,
};

const BEARER_TOKEN = `your_actual_token_here`;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

async function fetchNumbers(type) {
  const url = TEST_SERVER_URLS[type];
  if (!url) return null; 

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 500, 
    });
    return response.data.numbers;
  } catch (error) {
    console.error(`Error fetching numbers for type ${type}:`, error.message);
    return null;
  }
}

app.get('/numbers/:type', async (req, res) => {
  const type = req.params.type;

  const numbers = await fetchNumbers(type);

  if (!numbers) {
    return res.status(500).json({ error: 'Failed to fetch numbers.' });
  }

  updateWindow(numbers);

  res.json({
    window,
    average: calculateAverage(window),
  });
});


function updateWindow(newNumbers) {
  for (let num of newNumbers) {
    if (!window.includes(num)) {
      window.push(num);
      if (window.length > WINDOW_SIZE) {
        window.shift(); 
      }
    }
  }
}

function calculateAverage(arr) {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
}
