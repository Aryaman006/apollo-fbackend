const Doctor = require("../models/Doctor");

exports.addDoctor = async (req, res) => {
  try {
    const {
      name,
      experience,
      fees,
      rating,
      language,
      facility,
      mode,
      location,
    } = req.body;

    

    const feesNumber = parseFloat(fees);
    const experienceNumber = parseInt(experience);
    const ratingNumber = parseFloat(rating);

    let parsedLocation = location;
    if (typeof location === "string" && location.startsWith("{")) {
      try {
        parsedLocation = JSON.parse(location);
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: "Invalid location format",
        });
      }
    }

    const imagePath = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : "";

    const doctor = new Doctor({
      name,
      experience: experienceNumber,
      fees: feesNumber,
      rating: ratingNumber,
      language: Array.isArray(language) ? language : String(language).split(","),
      facility: Array.isArray(facility) ? facility : String(facility).split(","),
      mode: Array.isArray(mode) ? mode : String(mode).split(","),
      location: parsedLocation,
      image: imagePath,
    });

    await doctor.save();

    res.status(201).json({ success: true, doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

exports.listDoctors = async (req, res) => {
  try {
    const {
      mode,
      minExperience,
      maxExperience,
      minFee,
      maxFee,
      language,
      facility,
      location,
      rating,
      page = 1,
      limit = 10,
      sort ,
    } = req.query;

    const query = {};
    console.log(req.query);

    if (mode) query.mode = { $in: mode.split(",") };
    if (minExperience && maxExperience) {
      query.experience = {
        $gte: Number(minExperience),
        $lte: Number(maxExperience),
      };
    }
    if (minFee && maxFee) {
      query.fees = { $gte: Number(minFee), $lte: Number(maxFee) };
    }
    if (language) query.language = { $in: language.split(",") };
    if (facility) query.facility = { $in: facility.split(",") };
    if (location) query.location = location;

    const isEmptyQuery = Object.keys(query).length === 0;
    let doctorsQuery = isEmptyQuery ? Doctor.find() : Doctor.find(query);

    switch (sort) {
      case "experience":
        doctorsQuery = doctorsQuery.sort({ experience: -1 });
        break;
      case "priceLow":
        doctorsQuery = doctorsQuery.sort({ fees: 1 });
        break;
      case "priceHigh":
        doctorsQuery = doctorsQuery.sort({ fees: -1 });
        break;
      case "rating":
        doctorsQuery = doctorsQuery.sort({ rating: -1 });
        break;
      default:
        break;
    }

    const total = await Doctor.countDocuments(isEmptyQuery ? {} : query);
    const doctors = await doctorsQuery
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      doctors,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
