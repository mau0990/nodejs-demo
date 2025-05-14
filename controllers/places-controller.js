const HttpError = require("../models/httpError");
const { v4 } = require("uuid");

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

const createPlace = (req, res, next) => {
    const {title, description, location, address, creator} = req.body;
    const createdPlace = {
        id: v4(),
        title,
      description,
      location,
      address,
      creator,
    };

    DUMMY_PLACES.push(createdPlace);
    res.status(201).json({place: createPlace})
}

//Exports
exports.getPlaceById = getPlaceById;
exports.createPlace = createPlace;
exports.getAllData = getAllData;
