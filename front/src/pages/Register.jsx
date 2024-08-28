import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/RegistrationPaymentPage.css';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../security/AuthService';
import { generateInvoiceAndUpload } from '../facturation/facturation';

// Clé publique Stripe
const stripePromise = loadStripe('pk_test_51PsAzYP9TeSuUsuh03FRfwm9KuyYnpWs3WigexvUn82XwGo3pXF6QFh24xYvscsduDMVFItQxrRipA8Ws0BBgbN900lwZ8DeVC');

const CheckoutForm = ({ firstname, surname, email, address, phoneNumber, password, setMessage }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    // Créer un PaymentIntent via votre backend
    const res = await fetch('http://localhost:3000/payment/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 2000, currency: 'eur' }), // 2000 centimes = 20 euros
    });

    const { clientSecret } = await res.json();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: `${firstname} ${surname}`,
        },
      },
    });

    if (result.error) {
      setMessage(`Erreur de paiement: ${result.error.message}`);
    } else if (result.paymentIntent.status === 'succeeded') {
      // Si le paiement réussit, effectuer la registration
      const registerResponse = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname,
          lastname: surname,
          email,
          address: address,
          phone: phoneNumber,
          password
        }),
      });

      if (registerResponse.ok) {
        setMessage('Registration et paiement réussis !');
        const data = await registerResponse.json();
        const token = data.token;
        setToken(token)
        console.log('Token:', token);
        const userId = await fetch('http://localhost:3000/users/email/' + email).then((res) => res.json());
        console.log('User ID:', userId);
        await generateInvoiceAndUpload(firstname, surname, address, userId._id);
        console.log('Invoice generated and uploaded');
        navigate('/home');
      } else {
        setMessage('Erreur lors de la registration après paiement.');
      }
    }
  };

  return (
    <form className="form" onSubmit={handlePaymentSubmit}>
      <h2>Paiement</h2>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Payer 20€
      </button>
    </form>
  );
};

const RegistrationPaymentPage = () => {
  const [email, setEmail] = useState('');
  const [surname, setSurname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [message, setMessage] = useState('');

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const calculatePasswordStrength = (password) => {
    if (password.length < 6) return 'Faible';
    if (password.length >= 6 && password.length < 10) return 'Moyenne';
    if (password.length >= 10) return 'Forte';
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setIsPaymentReady(true);
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="container">
        {!isPaymentReady ? (
          <form className="form" onSubmit={handleRegisterSubmit}>
            <h2>Inscription</h2>
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Nom:</label>
            <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} required />

            <label>Prénom:</label>
            <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required />

            <label>Addresse:</label>
            <input type="tel" value={address} onChange={(e) => setAddress(e.target.value)} required />

            <label>Numéro de téléphone:</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />

            <label>Mot de passe:</label>
            <input type="password" value={password} onChange={handlePasswordChange} required />

            <label>Confirmez le mot de passe:</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

            <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
              Force du mot de passe: {passwordStrength}
            </div>

            <button type="submit">Continuer vers le paiement</button>
          </form>
        ) : (
          <CheckoutForm
            firstname={firstname}
            surname={surname}
            email={email}
            address={address}
            phoneNumber={phoneNumber}
            password={password}
            setMessage={setMessage}
          />
        )}
        {message && <div className="message">{message}</div>}
      </div>
    </Elements>
  );
};

export default RegistrationPaymentPage;
