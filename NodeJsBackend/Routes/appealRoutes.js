const express = require("express");
const {
  submitAppeal,
  getAppeals,
  recheckAppeal,
} = require("../Controllers/appealController");

const router = express.Router();

router.post("/submit", submitAppeal); // Route to submit an appeal
router.get("/", getAppeals); // Route to fetch all appeals
router.post("/recheck", recheckAppeal); // Route to recheck an appeal

module.exports = router;
