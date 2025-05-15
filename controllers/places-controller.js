const HttpError = require("../models/httpError");
const { v4 } = require("uuid");
const getCoordinates = require('../util/location');
const { validationResult } = require("express-validator");

const DUMMY_PLACES = [{
    id: 'P1',
    title: 'Empire State',
    description: 'One of the most visisted places',
    location: {
        lat: 40,
        lng: -73
    },
    address: 'address',
    creator: 'u1'
}];

const getAllData = (req, res, next) =>{
    res.json(DUMMY_PLACES);
};

const getPlaceById = (req, res, next) => {
  const id = req.params.pId;
  const place = DUMMY_PLACES.find((x) => x.id === id);

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      400
    );
    return next(error); //We use next for asynchronous implementation
  }
  res.json({ place });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid input passed", 422));
  }
  const {title, description, address, creator} = req.body;
  let coordinates;
  try {
    coordinates = await getCoordinates(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = {
    id: v4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace);
  res.status(201).json({ place: createdPlace });
}

//Exports
exports.getPlaceById = getPlaceById;
exports.createPlace = createPlace;
exports.getAllData = getAllData;
