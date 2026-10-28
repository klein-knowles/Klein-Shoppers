import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GiftCards = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [myCards, setMyCards] = useState([]);
  const [allCards, setAllCards] = useState([]);

  // Form states
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [expiryDays, setExpiryDays] = useState('365');
  
  // Check balance states
  const [checkCode, setCheckCode] = useState('');
  const [cardInfo, setCardInfo] = useState(null);
  
  // Redeem states
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');

  // Load my gift cards
  useEffect(() => {
    if (user) {
      fetchMyCards();
    }
  }, [user]);

  const fetchMyCards = async () => {
    try {
      const response = await axios.get('/api/giftcards/my-gift-cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMyCards(response.data.giftCards);
    } catch (error) {
      console.error('Error fetching gift cards:', error);
    }
  };

  const fetchAllCards = async () => {
    try {
      const response = await axios.get('/api/giftcards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAllCards(response.data.giftCards);
    } catch (error) {
      console.error('Error fetching all cards:', error);
    }
  };

  // CREATE gift card
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/giftcards/create', {
        amount: parseFloat(amount),
        recipientEmail,
        recipientName,
        message: giftMessage,
        expiryDays: parseInt(expiryDays)
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessage(`✅ ${response.data.message}`);
      setAmount('');
      setRecipientEmail('');
      setRecipientName('');
      setGiftMessage('');
      
      if (user?.isAdmin) {
        fetchAllCards();
      }
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // CHECK balance
  const handleCheckBalance = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCardInfo(null);
    setMessage('');

    try {
      const response = await axios.post('/api/giftcards/check', {
        code: checkCode
      });

      setCardInfo(response.data.giftCard);
      setMessage('✅ Card found!');
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // REDEEM gift card
  const handleRedeem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/giftcards/redeem', {
        code: redeemCode,
        amount: parseFloat(redeemAmount),
        orderId: 'ORDER-' + Date.now() // Replace with actual order ID
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessage(`✅ ${response.data.message}`);
      setRedeemCode('');
      setRedeemAmount('');
      fetchMyCards();
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', color: 'white' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🎁 Gift Cards</h1>
      <p style={{ color: '#aaa', marginBottom: '30px' }}>Create, redeem, and manage gift cards</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {['create', 'check', 'redeem', 'my-cards'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setMessage('');
              setCardInfo(null);
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: activeTab === tab ? '2px solid #0066ff' : '1px solid #333',
              background: activeTab === tab ? '#0066ff' : 'transparent',
              color: activeTab === tab ? 'white' : '#aaa',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal'
            }}
          >
            {tab === 'create' && '✨ Create'}
            {tab === 'check' && '🔍 Check Balance'}
            {tab === 'redeem' && '💳 Redeem'}
            {tab === 'my-cards' && '📋 My Cards'}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: message.includes('✅') ? '#1a3a1a' : '#3a1a1a',
          color: message.includes('✅') ? '#00cc66' : '#ff4444'
        }}>
          {message}
        </div>
      )}

      {/* ===== TAB 1: CREATE ===== */}
      {activeTab === 'create' && (
        <div style={{ background: '#1a1a1a', padding: '25px', borderRadius: '12px' }}>
          <h2 style={{ marginBottom: '20px' }}>✨ Create Gift Card</h2>
          
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Expiry (days)</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
                >
                  <option value="30">30 days (1 month)</option>
                  <option value="90">90 days (3 months)</option>
                  <option value="180">180 days (6 months)</option>
                  <option value="365" selected>365 days (1 year)</option>
                  <option value="730">730 days (2 years)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Recipient Email *</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
                required
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
                placeholder="John Doe"
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Personal Message</label>
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
                rows="3"
                placeholder="Happy Birthday! 🎉"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '20px',
                background: '#0066ff',
                color: 'white',
                padding: '14px 40px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creating...' : '🎁 Create Gift Card'}
            </button>
          </form>
        </div>
      )}

      {/* ===== TAB 2: CHECK BALANCE ===== */}
      {activeTab === 'check' && (
        <div style={{ background: '#1a1a1a', padding: '25px', borderRadius: '12px' }}>
          <h2 style={{ marginBottom: '20px' }}>🔍 Check Gift Card Balance</h2>
          
          <form onSubmit={handleCheckBalance}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Gift Card Code</label>
              <input
                type="text"
                value={checkCode}
                onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
                placeholder="GIFT-ABCD-1234-EFGH"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '15px',
                background: '#00cc66',
                color: 'white',
                padding: '14px 40px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Checking...' : '🔍 Check Balance'}
            </button>
          </form>

          {/* Display card info */}
          {cardInfo && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: '#0a2a1a',
              borderRadius: '8px',
              border: '1px solid #00cc66'
            }}>
              <h3 style={{ color: '#00cc66' }}>💳 Card Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <div><strong>Code:</strong> {cardInfo.code}</div>
                <div><strong>Amount:</strong> ${cardInfo.amount}</div>
                <div><strong>Balance:</strong> <span style={{ color: '#00cc66', fontWeight: 'bold' }}>${cardInfo.remainingBalance}</span></div>
                <div><strong>Status:</strong> <span style={{ color: cardInfo.isValid ? '#00cc66' : '#ff4444' }}>{cardInfo.status}</span></div>
                <div><strong>Expiry:</strong> {new Date(cardInfo.expiryDate).toLocaleDateString()}</div>
                <div><strong>Recipient:</strong> {cardInfo.recipientName}</div>
              </div>
              {cardInfo.message && <p style={{ marginTop: '10px', color: '#aaa' }}>💬 "{cardInfo.message}"</p>}
              {cardInfo.isExpired && <p style={{ color: '#ff4444', marginTop: '10px' }}>⚠️ This card has expired</p>}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB 3: REDEEM ===== */}
      {activeTab === 'redeem' && (
        <div style={{ background: '#1a1a1a', padding: '25px', borderRadius: '12px' }}>
          <h2 style={{ marginBottom: '20px' }}>💳 Redeem Gift Card</h2>
          
          <form onSubmit={handleRedeem}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Gift Card Code</label>
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
                placeholder="GIFT-ABCD-1234-EFGH"
                required
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Amount to Redeem ($)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
                placeholder="50.00"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '15px',
                background: '#ff8800',
                color: 'white',
                padding: '14px 40px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Processing...' : '💳 Redeem Now'}
            </button>
          </form>
        </div>
      )}

      {/* ===== TAB 4: MY CARDS ===== */}
      {activeTab === 'my-cards' && (
        <div style={{ background: '#1a1a1a', padding: '25px', borderRadius: '12px' }}>
          <h2 style={{ marginBottom: '20px' }}>📋 My Gift Cards</h2>
          
          {myCards.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '40px 0' }}>
              You don't have any gift cards yet. 🎁
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {myCards.map(card => (
                <div
                  key={card.code}
                  style={{
                    padding: '20px',
                    background: card.isExpired ? '#2a1a1a' : '#0a2a1a',
                    borderRadius: '8px',
                    border: card.isExpired ? '1px solid #ff4444' : '1px solid #00cc66',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{card.code}</div>
                    <div style={{ color: '#aaa', fontSize: '14px' }}>
                      Amount: ${card.amount} | Remaining: ${card.remainingBalance}
                    </div>
                    <div style={{ color: '#aaa', fontSize: '14px' }}>
                      Expires: {new Date(card.expiryDate).toLocaleDateString()}
                    </div>
                    {card.message && <div style={{ color: '#aaa', fontSize: '14px', fontStyle: 'italic' }}>"{card.message}"</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: card.isExpired ? '#ff4444' : card.status === 'redeemed' ? '#ff8800' : '#00cc66',
                      color: 'white'
                    }}>
                      {card.isExpired ? 'EXPIRED' : card.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin: All Cards */}
      {user?.isAdmin && (
        <div style={{ marginTop: '30px' }}>
          <button
            onClick={fetchAllCards}
            style={{
              background: '#333',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📊 View All Gift Cards (Admin)
          </button>
          
          {allCards.length > 0 && (
            <div style={{ marginTop: '15px', background: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
              <h3>All Gift Cards ({allCards.length})</h3>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {allCards.map(card => (
                  <div key={card._id} style={{ padding: '10px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{card.code}</span>
                    <span>${card.amount}</span>
                    <span style={{ color: card.status === 'active' ? '#00cc66' : '#ff4444' }}>{card.status}</span>
                    <span style={{ color: '#aaa' }}>{card.recipientEmail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GiftCards;