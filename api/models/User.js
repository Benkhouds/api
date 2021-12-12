import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
   firstName: {
      type: String,
      required: [true, 'Please provide your first name'],
   },

   lastName: {
      type: String,
      require: [true, 'please provide your last name'],
   },
   email: {
      type: String,
      required: [true, 'Please provide an email '],
      unique: true,
      match: [
         /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
         'Please provide a valid email',
      ],
   },
   password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: 6,
      select: false,
   },
   tokenVersion: {
      type: Number,
      default: 0,
   },
});

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) {
      next();
   }
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
   next();
});

userSchema.methods.matchPassword = async function (password) {
   return bcrypt.compare(password, this.password);
};

userSchema.methods.createAccessToken = function () {
   return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
   });
};

userSchema.methods.createRefreshToken = function () {
   return jwt.sign(
      { id: this._id, version: this.tokenVersion },
      process.env.REFRESH_TOKEN_SECRET,
      {
         expiresIn: '7d',
      }
   );
};

const User = mongoose.model('User', userSchema);

export default User;
