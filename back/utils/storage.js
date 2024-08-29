const User = require('../models/user');

exports.isStorageAvailable = async (userId, weight) => {
  console.log('userId:', userId);
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) throw new Error('User not found');
    console.log('User found:', user);
    console.log('Weight:', weight);
    return user.stockageLeft >= weight;
  } catch (error) {
    console.error('Error checking user storage space:', error);
    return false;
  }
};

exports.updateStockageLeft = async (userId, weight) => {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) throw new Error('User not found');
    console.log('User found:', user);
    console.log('Weight:', weight);
    user.stockageLeft -= weight;
    await user.save();
  } catch (error) {
    console.error('Error updating user storage space:', error);
  }
};
