const stripe = require('../payment/stripe');

// Créer un paiement
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;

    // Créer un PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'], // Types de paiement acceptés
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Erreur lors de la création du PaymentIntent:', error);
    res.status(500).send({ error: 'Erreur lors de la création du paiement' });
  }
};

// Webhook pour Stripe
exports.handleWebhook = (req, res, next) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'VOTRE_SECRET_WEBHOOK';

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.log(`⚠️  Erreur lors de la vérification du webhook: ${err.message}`);
    return res.sendStatus(400);
  }

  // Gérer l'événement
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`💰 Paiement réussi pour ${paymentIntent.amount}`);
      // Mettre à jour votre base de données, envoyer un email, etc.
      break;
    // ... gérer d'autres types d'événements
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
