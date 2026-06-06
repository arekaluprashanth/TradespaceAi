(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester', email: 'tester+ci@example.com', password: 'Password123!' }),
    });
    const json = await res.json();
    console.log(JSON.stringify(json));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
