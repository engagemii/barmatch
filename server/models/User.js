const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['bartender', 'venue'],
  },
  profile: {
    // Bartender fields
    name: String,
    avatar: String,
    photos: [String],
    title: String,
    yearsExp: Number,
    specialties: [String],
    certs: [String],
    venueTypesLove: [String],
    availability: {
      sun: { type: Boolean, default: false },
      mon: { type: Boolean, default: false },
      tue: { type: Boolean, default: false },
      wed: { type: Boolean, default: false },
      thu: { type: Boolean, default: false },
      fri: { type: Boolean, default: false },
      sat: { type: Boolean, default: false },
    },
    availableNow: { type: Boolean, default: false },
    bio: String,
    hourlyRate: {
      min: Number,
      max: Number,
    },

    // Venue fields
    venueName: String,
    venueType: String,
    address: String,
    rating: Number,
    seats: Number,
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
    },
    openShifts: Number,
    activelyHiring: { type: Boolean, default: false },
    lookingFor: [String],
    vibe: [String],
    perks: String,
  },
  location: {
    city: String,
    neighborhood: String,
    lat: Number,
    lng: Number,
  },
  swipedRight: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  swipedLeft: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  superSwiped: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reviewCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  pushToken: String,
  isOnboarded: { type: Boolean, default: false },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.swipedRight;
  delete obj.swipedLeft;
  delete obj.superSwiped;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
