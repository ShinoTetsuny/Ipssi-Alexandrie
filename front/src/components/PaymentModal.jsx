import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/components/PaymentModal.css';
import { generateInvoiceAndUpload } from '../facturation/facturation';
import { getToken, getUserId } from '../security/AuthService';

const stripePromise = loadStripe('pk_test_51PsAzYP9TeSuUsuh03FRfwm9KuyYnpWs3WigexvUn82XwGo3pXF6QFh24xYvscsduDMVFItQxrRipA8Ws0BBgbN900lwZ8DeVC');

const CheckoutForm = ({ user, onClose, setMessage }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    try {
      // Créer une intention de paiement avec votre backend
      const res = await fetch('http://localhost:3000/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 2000, currency: 'eur' }), // Montant du paiement pour 20 Go de stockage
      });

      const { clientSecret } = await res.json();

      // Confirmer le paiement avec Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${user.firstname} ${user.lastname}`,
            email: user.email,
            address: {
              line1: user.address,
            },
            phone: user.phone,
          },
        },
      });

      if (result.error) {
        setMessage(`Erreur de paiement: ${result.error.message}`);
      } else if (result.paymentIntent.status === 'succeeded') {
        setMessage('Paiement réussi !');

        // Appeler l'API pour ajouter du stockage après le paiement réussi
        const storageResponse = await fetch(`http://localhost:3000/payment/buy-storage/${user._id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`, // Assurez-vous que le token est stocké et accessible
            'Content-Type': 'application/json'
          },
        });

        if (storageResponse.ok) {
          const storageData = await storageResponse.json();
          setMessage(storageData.message);

          // Générer et télécharger la facture
          console.log('Générer et télécharger la facture pour:', user.firstname, user.lastname, user.address, user._id);
          await generateInvoiceAndUpload(user.firstname, user.lastname, user.address, user._id);
          setMessage('Facture générée et téléchargée avec succès.');
        } else {
          const errorData = await storageResponse.json();
          setMessage(`Erreur lors de l'ajout du stockage: ${errorData.error}`);
        }

        onClose();
      }
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      setMessage('Erreur lors du traitement du paiement.');
    }
  };

  return (
    <form className="checkout-form" onSubmit={handlePaymentSubmit}>
      <h2>Paiement</h2>
      <CardElement />
      <button type="submit" disabled={!stripe}>Payer 20€ pour 20 Go</button>
    </form>
  );
};

const PaymentModal = ({ user, onClose }) => {
  const [message, setMessage] = useState('');

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <Elements stripe={stripePromise}>
          <CheckoutForm user={user} onClose={onClose} setMessage={setMessage} />
        </Elements>
        {message && <div className="message">{message}</div>}
        <button onClick={onClose} className="close-button">Fermer</button>
      </div>
    </div>
  );
};

export default PaymentModal;
