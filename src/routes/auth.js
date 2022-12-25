const router = require("express").Router();
const bcrypt = require("bcrypt");
const UserSchema = require("../models/User.js");

function generateToken() {
  return Math.floor(1000000000000000 + Math.random() * 9000000000000000)
      .toString(36).substr(0, 10)
}
// REGISTER
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);

    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new UserSchema({
      name: req.body.name,
      email: req.body.email,
      password: hashedPass,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await UserSchema.findOne({
      email: req.body.email,
    });
    !user && res.status(400).json("Wrong credentials!");

    const validated = await bcrypt.compare(req.body.password, user.password);
    !validated && res.status(400).json("Wrong credentials!");
    const token = generateToken()

    const { password, ...others } = user._doc;

    res.status(200).json({...others, token});
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;