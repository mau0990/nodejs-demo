const axios = require("axios");
const HttpError = require("../models/httpError");

const getCoordinates = async (address) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    throw new HttpError(
      "Could not find any location for the specific address",
      422
    );
  }
  console.log(data);
  const coordinates = data.results[0].geometry.location;
  console.log(coordinates);
  return coordinates;
};

module.exports = getCoordinates;
