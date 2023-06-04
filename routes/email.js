const express = require('express');

const {sendEmail} = require('../Controllers/email');


const router = express.Router();

router.post('/sendEmail', sendEmail);

module.exports = router;
