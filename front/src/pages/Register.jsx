import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/RegistrationPaymentPage.css';
import { useNavigate, Link } from 'react-router-dom';
import { getUserId, setToken } from '../security/AuthService';
import { generateInvoiceAndUpload } from '../facturation/facturation';

const stripePromise = loadStripe('pk_test_51PsAzYP9TeSuUsuh03FRfwm9KuyYnpWs3WigexvUn82XwGo3pXF6QFh24xYvscsduDMVFItQxrRipA8Ws0BBgbN900lwZ8DeVC');

const CheckoutForm = ({ formData, setMessage }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    const res = await fetch('http://localhost:3000/payment/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 2000, currency: 'eur' }),
    });

    const { clientSecret } = await res.json();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: `${formData.firstname} ${formData.surname}`,
        },
      },
    });

    if (result.error) {
      setMessage(`Erreur de paiement: ${result.error.message}`);
    } else if (result.paymentIntent.status === 'succeeded') {
      const registerResponse = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          name: formData.firstname,
          lastname: formData.surname,
          address: formData.address,
          firstname: formData.firstname,
        }),
      });

      if (registerResponse.ok) {
        setMessage('Registration et paiement réussis !');
        const data = await registerResponse.json();
        const token = data.token;
        setToken(token)
        console.log('Token:', token);
        const userId = await fetch('http://localhost:3000/users/email/' + formData.email).then((res) => res.json());
        console.log('User ID:', userId);
        await generateInvoiceAndUpload(formData.firstname, formData.surname, formData.address, userId._id);
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
      <button type="submit" disabled={!stripe}>Payer 20€</button>
    </form>
  );
};

const RegistrationPaymentPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    surname: '',
    firstname: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/;
  const veryStrongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{16,}$/;

  const calculatePasswordStrength = (password) => {
    if (veryStrongPasswordRegex.test(password)) return 'Très Fort';
    if (strongPasswordRegex.test(password)) return 'Fort';
    if (passwordRegex.test(password)) return 'Moyen';
    return 'Faible';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
      if (!passwordRegex.test(value)) {
        setPasswordError('Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
    } else if (passwordStrength === 'Faible') {
      setMessage('Le mot de passe doit être au moins de force moyenne pour continuer.');
    } else {
      setIsPaymentReady(true);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="container">
        {!isPaymentReady ? (
          <form className="form" onSubmit={handleRegisterSubmit}>
            <h2>Inscription</h2>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />

            <label>Nom:</label>
            <input type="text" name="surname" value={formData.surname} onChange={handleInputChange} required />

            <label>Prénom:</label>
            <input type="text" name="firstname" value={formData.firstname} onChange={handleInputChange} required />

            <label>Addresse:</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />

            <label>Numéro de téléphone:</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />

            <label>Mot de passe: 
              <span className="tooltip">ℹ️
                <span className="tooltiptext">
                  Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.
                </span>
              </span>
            </label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />

            <label>Confirmez le mot de passe:</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
            {formData.password !== formData.confirmPassword && <div className="error-message">Les mots de passe ne correspondent pas.</div>}

            <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
              Force du mot de passe: {passwordStrength}
            </div>

            <button type="submit" disabled={passwordStrength === 'Faible' || formData.password !== formData.confirmPassword}>
              Continuer vers le paiement
            </button>
          </form>
        ) : (

          <CheckoutForm formData={formData} setMessage={setMessage} />
        )}
        {message && <div className="message">{message}</div>}
        {!isPaymentReady && <Link to="/">Déjà un compte? Connectez-vous</Link>}
      </div>
    </Elements>
  );
};

export default RegistrationPaymentPage;
