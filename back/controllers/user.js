const bcrypt = require('bcrypt');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const { deleteFilesFromClient } = require('../controllers/file');
const File = require('../models/file');

exports.createUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone: req.body.phone,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      stockageLeft: req.body.stockageTotal,
      stockageTotal: req.body.stockageTotal,
    });
    const result = await user.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({});
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ error });
    }
  };

exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) throw new Error('User not found');
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) throw new Error('User not found');
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
    if (!user) throw new Error('User not found');
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Trouver les fichiers associés à l'utilisateur
    const files = await File.find({ client: req.params.id });
    if (!files.length) {
      console.error('No files found for the client');
      return res.status(404).json({ success: false, message: 'No files found for this client' });
    }

    // Compter le nombre total de fichiers
    const totalFiles = files.length;

    // Supprimer les fichiers associés à l'utilisateur
    await deleteFilesFromClient(req.params.id);

    // Supprimer l'utilisateur de la base de données
    const user = await User.findOneAndDelete({ _id: req.params.id });
    if (!user) throw new Error('User not found');

    // Configuration du transporteur Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
        user: 'alexendrie.ipssi@gmail.com', // Votre adresse email
        pass: 'bayjqloghafcrwsk' // Mot de passe de l'application
      },
    });

    // Définition des options de l'email
    const mailOptions = {
      from: 'alexendrie.ipssi@gmail.com',
      to: 'alexendrie.ipssi@gmail.com',
      subject: 'Suppression d\'utilisateur',
      text: `${user.firstname} ${user.lastname} a été supprimé de la base de données, et a supprimé ${totalFiles} fichiers.`,
    };

    console.log('Envoi de l\'email...');
    // Envoi de l'email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
      } else {
        console.log('Email envoyé:', info.response);
      }
    });

    // Répondre avec succès après suppression
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.isStorageAvailable = async (userId, weight) => {
  console.log(  'userId:', userId);
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) throw new Error('User not found');
    console.log('User found:', user);
    console.log('Weight:', weight);
    if (user.stockageLeft < weight) {
      return false;
    }
    return true;
  }
  catch (error) {
    console.error('Error checking user storage space:', error);
  }
}

exports.updateStockageLeft = async (userId, weight) => {
  try {
    const user = await User.findOne({ _id: userId
    });
    if (!user) throw new Error('User not found');
    console.log('User found:', user);
    console.log('Weight:', weight);
    user.stockageLeft -= weight;
    await user.save();
  }
  catch (error) {
    console.error('Error updating user storage space:', error);
  }
}