const express = require("express");
const router = express.Router();
const { check } = require('express-validator');
const placesController = require('../controllers//places-controller');

router.get('/', placesController.getAllData);

router.get("/:pId", placesController.getPlaceById);

router.post(
  "/",
  [
    check("title").notEmpty(),
    check("address").notEmpty(),
    check("description").notEmpty(),
    check("creator").notEmpty(),
  ],
  placesController.createPlace
);

router.put("/:pid", placesController.updatePlace);
router.delete("/:pid", placesController.deletePlace);
module.exports = router;
