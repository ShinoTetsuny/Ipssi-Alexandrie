const stripe = require('../payment/stripe');
const User = require('../models/user');

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

exports.buyStorage = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const storageToAdd = 21474836480; // 20 Mo en octets

        // Trouver l'utilisateur par son ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ error: 'Utilisateur non trouvé.' });
        }

        // Ajouter le stockage au total et à la quantité restante
        user.stockageTotal += storageToAdd;
        user.stockageLeft += storageToAdd;

        // Sauvegarder les modifications dans la base de données
        await user.save();

        // Configuration du transporteur Nodemailer
        const transporter = nodemailer.createTransport({
          service: 'Gmail', // ou un autre service comme 'Outlook', 'Yahoo', etc.
          auth: {
            user: 'alexendrie.ipssi@gmail.com', // Votre adresse email
            pass: 'bayjqloghafcrwsk'
          },
        });

        const mailOptions = {
          from: 'alexendrie.ipssi@gmail.com',
          to: user.email,
          subject: 'MERCI POUR VOTRE ACHAT',
          text: 'Vous avez acheter 20go avec succes  !',
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Erreur lors de l\'envoi de l\'email:', error);
          } else {
            console.log('Email envoyé:', info.response);
          }
        });

        res.status(200).send({ message: `20 Go de stockage ajoutés avec succès. Stockage total: ${user.stockageTotal / (21474836480)} Go, Stockage restant: ${user.stockageLeft / (21474836480)} Go` });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du stockage:', error);
        res.status(500).send({ error: 'Erreur lors de l\'ajout du stockage' });
    }
};
