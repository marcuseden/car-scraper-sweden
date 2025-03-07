const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ['private', 'dealer', 'unknown'],
    default: 'unknown'
  },
  phone: String,
  email: String,
  location: String,
  rating: Number,
  reviewCount: Number,
  logo: String
});

const imageSchema = new mongoose.Schema({
  url: String,
  isMain: {
    type: Boolean,
    default: false
  }
});

const carListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'SEK'
  },
  year: Number,
  make: String,
  model: String,
  mileage: Number,
  mileageUnit: {
    type: String,
    default: 'km'
  },
  fuel: String,
  fuelType: String,
  transmission: String,
  color: String,
  description: String,
  location: String,
  images: [imageSchema],
  features: [String],
  seller: sellerSchema,
  sourceUrl: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    required: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  horsePower: Number,
  modelYear: Number,
  bodyType: String,
  driveType: String,
  vin: String,
  registrationNumber: String,
  doors: Number,
  seats: Number,
  weight: Number,
  length: Number,
  width: Number,
  height: Number,
  engineSize: String,
  enginePower: String,
  co2Emission: String,
  fuelConsumption: String,
  condition: String,
  firstRegistration: Date,
  lastInspection: Date,
  warranty: String,
  serviceHistory: String
}, { timestamps: true, strict: false });

// Create indexes for common queries
carListingSchema.index({ make: 1, model: 1 });
carListingSchema.index({ price: 1 });
carListingSchema.index({ year: 1 });
carListingSchema.index({ location: 1 });
carListingSchema.index({ 'seller.type': 1 });
carListingSchema.index({ sourceUrl: 1 }, { unique: true });

const CarListing = mongoose.model('CarListing', carListingSchema);

module.exports = CarListing; 