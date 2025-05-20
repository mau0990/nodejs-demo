const HttpError = require("../models/httpError");
const { v4 } = require("uuid");
const getCoordinates = require("../util/location");
const { validationResult } = require("express-validator");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");

const getAllData = async (req, res, next) => {
  let places;
  try {
    places = await Place.find();
  } catch (err) {
    const error = new HttpError("Something went worng in db.", 400);
    return next(error); //We use next for asynchronous implementation
  }

  res.json({ places: places.map((x) => x.toObject({ getters: true })) });
};

const getPlaceById = async (req, res, next) => {
  const id = req.params.pId;

  let place;
  try {
    place = await Place.findById(id).populate("creator");
  } catch (err) {
    const error = new HttpError("Something went worng in db.", 400);
    return next(error); //We use next for asynchronous implementation
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      400
    );
    return next(error); //We use next for asynchronous implementation
  }
  res.json({ place: place.ma((x) => x.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid input passed", 422));
  }

  const { title, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordinates(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://zelda.nintendo.com/tears-of-the-kingdom/_images/features/link-crouching.png",
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Could get user.", 500);
    return next(error); //We use next for asynchronous implementation
  }

  if (!user) {
    const error = new HttpError("User not found", 500);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session });
    user.places.push(createdPlace);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError("Could not create the place. " + err, 500);
    return next(error); //We use next for asynchronous implementation
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const pid = req.params.pid;
  const { title, description } = req.body;
  let place;

  try {
    place = await Place.findById(pid).populate("creator");
  } catch (err) {
    return next(new HttpError("Something went wrong in db.", 400));
  }
  place.title = title || place.title;
  place.description = description || place.description;

  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError("You are not allow to update this place", 403));
  }
  try {
    await place.save();
  } catch (error) {
    return next(new HttpError("Something went wrong in db.", 400));
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const pid = req.params.pid;
  let place;
  console.log(pid);
  try {
    place = await Place.findById(pid).populate("creator"); // Populate will include linked user object
  } catch (err) {
    return next(new HttpError("Something went wrong in db." + err, 400));
  }
  if (!place) {
    return next(new HttpError("Place not found" + err, 404));
  }
  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError("You are not allow to update this place", 403));
  }
  try {
    //await place.deleteOne();
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.deleteOne({ session });
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong in db.", 400));
  }
  console.log("hi");
  res.status(200).json({ message: "Place deleted!" });
};
//Exports
exports.getPlaceById = getPlaceById;
exports.createPlace = createPlace;
exports.getAllData = getAllData;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
