const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.register = async (req, res, next) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        password: hashedPassword
      });
      const result = await user.save();
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error });
    }
  };
  
  exports.login = async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user && await bcrypt.compare(req.body.password, user.password)) {
        const token = jwt.sign({ _id: user._id }, 'secretKey');
        res.status(200).json({ token });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      res.status(400).json({ error });
    }
  };