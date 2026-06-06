(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/health');
    const json = await res.json();
    if (json && json.status === 'ok') {
      console.log('HEALTH OK:', JSON.stringify(json));
      process.exit(0);
    } else {
      console.error('HEALTH FAIL:', JSON.stringify(json));
      process.exit(2);
    }
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
