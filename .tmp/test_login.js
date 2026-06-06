(async () => {
  try {
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tester+ci@example.com', password: 'Password123!' }),
    });
    const login = await loginRes.json();
    console.log('LOGIN:', JSON.stringify(login));

    const profileRes = await fetch('http://localhost:3001/api/auth/profile', {
      headers: { Authorization: `Bearer ${login.token}` },
    });
    const profile = await profileRes.json();
    console.log('PROFILE:', JSON.stringify(profile));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
