const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const User = ('../../models/User.js');

// @route   POST api/users
// @desc    Register User
// @access  Public

router.post(
    '/',
    [
        check(name, 'Name is Reqired').not().isEmpty(),
        check(username, 'Username is Reqired').not().isEmpty(),
        check(email, 'Please include a valid email.').isEmail(),
        check(password, 'Please enter a password with at least 6 characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, username, email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'User already exists' }] });
            }

            const avatar = normalize(
                gravatar.url(email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm'
                }),
                { forceHttps: true }
            );

            user = new User({
                name,
                username,
                email,
                avatar,
                password,
            });

            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: '5 days' },
                (err, token) => {
                    if(err) throw err;
                    res.json({ token });
                }
            );
        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;