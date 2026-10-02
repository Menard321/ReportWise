fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: "test2@test.com", firstName: "Test", lastName: "User", password: "password", accountType: "Student" })
}).then(res => res.text()).then(text => console.log('RESPONSE:', text)).catch(console.error);
