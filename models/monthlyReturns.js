import mongoose from 'mongoose';

const MonthlyReturnsSchema = new mongoose.Schema(
  {
    AccountID: {
      type: String,
      ref: 'User', // Assuming you have a User model
      required: true,
      unique: true, // Each AccountId has a single document
    },
    returns: [
      {
        date: {
          type: Date,
          required: true, // Date of the return
        },
        returnAmount: {
          type: Number,
          default: null, // Either returnAmount or returnPercentage will be provided
        },
        returnPercentage: {
          type: Number,
          default: null,
        },
        newDate: {
          type: Date,
          required: Date.now(), // When the return was processed
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now, // Automatically updates when the document is modified
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Virtual field to calculate total return amount
MonthlyReturnsSchema.virtual('totalReturns').get(function () {
  return this.returns.reduce((total, returnItem) => {
    return total + (returnItem.returnAmount || 0);
  }, 0);
});

// Middleware to update lastUpdated field
MonthlyReturnsSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

const MonthlyReturns = mongoose.model('MonthlyReturns', MonthlyReturnsSchema);

export default MonthlyReturns;

