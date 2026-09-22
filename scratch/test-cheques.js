const http = require('http');

async function main() {
  // 1. Login
  const loginData = JSON.stringify({ email: 'presenting@snb.com', password: 'password123' });
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginData,
  });
  const { token } = await loginRes.json();
  console.log('Logged in successfully, token retrieved.');

  // 2. Get Cheques
  const chequesRes = await fetch('http://localhost:5000/api/cheques', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const cheques = await chequesRes.json();
  console.log(`Total cheques returned: ${cheques.length}`);

  // 3. Inspect images
  const sampleCheques = cheques.slice(0, 5).map(c => ({
    chequeNumber: c.chequeNumber,
    payeeName: c.payeeName,
    amount: c.amount,
    imageUrl: c.imageUrl,
  }));
  console.table(sampleCheques);

  // 4. Test frontend serving images
  for (const img of ['/sample-cheque.jpg', '/cheque-000102.jpg', '/cheque-000123.jpg']) {
    const res = await fetch(`http://localhost:5174${img}`);
    console.log(`Frontend Vite serves ${img}: ${res.status} ${res.statusText} (${res.headers.get('content-type')}, ${res.headers.get('content-length')} bytes)`);
  }
}

main().catch(err => console.error(err));
