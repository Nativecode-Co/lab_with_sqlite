const express = require('express');
const { print } = require('./controller');

const router = express.Router();

router.get("/", print);

module.exports = router;