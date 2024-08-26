require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.SECRET_KEY_STRIPE);

module.exports = stripe;