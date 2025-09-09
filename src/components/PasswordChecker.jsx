import React, { useState } from 'react';

const checkStrength = (password) => {
  let score = 0;
  if (password.length > 7) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return 'Weak';
  if (score === 2 || score === 3) return 'Medium';
  return 'Strong';
};

const PasswordChecker = () => {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState('');
  const [breachCount, setBreachCount] = useState(null);

  const handlePasswordChange = async (e) => {
    const pass = e.target.value;
    setPassword(pass);
    setStrength(checkStrength(pass));
    checkBreach(pass);
  };

  const checkBreach = async (password) => {
    const sha1 = await sha1Hash(password);
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5).toUpperCase();

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await res.text();

    const lines = text.split('\n');
    const found = lines.find(line => line.startsWith(suffix));

    if (found) {
      const count = parseInt(found.split(':')[1]);
      setBreachCount(count);
    } else {
      setBreachCount(0);
    }
  };

  const sha1Hash = async (input) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-1', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-center">🔐 Password Strength & Breach Checker</h2>
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={handlePasswordChange}
        className="w-full px-4 py-2 border rounded-lg mb-4 outline-none focus:ring-2 ring-blue-500"
      />
      <p className="text-lg font-semibold mb-2">
        Strength: <span className={
          strength === 'Strong' ? 'text-green-600' :
          strength === 'Medium' ? 'text-yellow-500' :
          'text-red-600'
        }>{strength}</span>
      </p>

      {breachCount !== null && (
        <p className="text-sm">
          {breachCount > 0 ? (
            <span className="text-red-500">⚠️ This password has appeared in {breachCount.toLocaleString()} breaches!</span>
          ) : (
            <span className="text-green-600">✅ This password has not been found in known breaches.</span>
          )}
        </p>
      )}
    </div>
  );
};

export default PasswordChecker;
