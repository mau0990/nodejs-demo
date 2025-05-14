const express = require("express");
const router = express.Router();

const placesController = require('../controllers//places-controller');

router.get('/', placesController.getAllData);

router.get("/:pId", placesController.getPlaceById);

router.post("/", placesController.createPlace);

module.exports = router;
