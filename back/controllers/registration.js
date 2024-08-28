const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer');

exports.register = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      address: req.body.address,
      phone: req.body.phone,
      password: hashedPassword,
      role: ['USER'],
      stockageTotal: 21474836480,
      stockageLeft: 21474836480,
    });
    const result = await user.save();

    const token = jwt.sign({ _id: result._id, role: result.role }, process.env.JWT_SECRET); 

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
      subject: 'Bienvenue sur notre application',
      text: 'Merci de vous être inscrit !',
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Erreur lors de l\'envoi de l\'email:', error);
      } else {
        console.log('Email envoyé:', info.response);
      }
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ error, req: req.body });
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
      res.status(200).json({ token });
    } else {
      throw new Error('Email ou mot de passe invalide');
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};