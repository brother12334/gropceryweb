import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Home.css';

const socket = io('http://localhost:5000'); // Replace with your backend URL

function Home() {
  const [location, setLocation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [coins, setCoins] = useState(50); // Default coins for demo
  const [favorItem, setFavorItem] = useState('');

  // Track user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);

          // Send location to the server
          socket.emit('location', coords);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, []);

  // Listen for notifications
  useEffect(() => {
    socket.on('location-update', (data) => {
      setNotifications((prev) => [
        ...prev,
        `A friend is near latitude ${data.latitude}, longitude ${data.longitude}`,
      ]);
    });

    return () => {
      socket.off('location-update');
    };
  }, []);

  // Handle favor requests
  const requestFavor = async () => {
    if (coins < 10) {
      alert('Not enough coins to request a favor.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/favors/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requester: '1234567890', item: favorItem }), // Replace with actual phone number
      });

      const data = await response.json();
      if (response.ok) {
        setCoins((prev) => prev - 10);
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error requesting favor:', error);
      alert('Failed to request favor.');
    }
  };

  return (
    <div className="home">
      <div className="ocean">
        <h1>Friend Favor</h1>
        <p>Track friends and exchange favors for coins!</p>

        {location && (
          <div className="location">
            <h3>Your Current Location:</h3>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
          </div>
        )}

        <div className="coins">
          <h3>Your Coins: {coins}</h3>
        </div>

        <div className="favor-request">
          <h3>Request a Favor</h3>
          <input
            type="text"
            placeholder="Enter item"
            value={favorItem}
            onChange={(e) => setFavorItem(e.target.value)}
          />
          <button onClick={requestFavor}>Request</button>
        </div>

        <div className="notifications">
          <h3>Notifications</h3>
          <ul>
            {notifications.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
