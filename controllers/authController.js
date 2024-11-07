const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signUp = async (req, res) => {
  const { username, password } = req.body;
  const hashpassword = await bcrypt.hash(password, 12);

  try {
    const newUser = await User.create({
      username,
      password: hashpassword,
    });
    req.session.user = newUser;
    res.status(200).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "fail",
    });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({username});

    if(!user) {
        return res.status(400).json({
            status: 'fail',
            message: 'user not found'
        });
    };

    const isCorrect = await bcrypt.compare(password, user.password)

    if(!isCorrect) {
        
        return res.status(400).json({
            status: 'fail',
            message: 'Incorrect username or password'
        });
    }
    req.session.user = user;
    res.status(200).json({
      status: "Login success",
    });

  } catch (e) {
    res.status(400).json({
      status: "fail",
    });
  }
};