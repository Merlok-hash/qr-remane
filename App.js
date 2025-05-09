
import React, { useState, useEffect } from 'react';
import QRUpload from './components/QRUpload';
import TransactionHistory from './components/TransactionHistory';

function App() {
  const [transactions, setTransactions] = useState([]);

  // Fetch transaction history
  useEffect(() => {
    fetch('/transactions')
      .then((response) => response.json())
      .then((data) => setTransactions(data))
      .catch((error) => console.error('Error fetching transactions:', error));
  }, []);

  return (
    <div className="App">
      <h1>QR Payment System</h1>
      <QRUpload />
      <TransactionHistory transactions={transactions} />
    </div>
  );
}

export default App;
