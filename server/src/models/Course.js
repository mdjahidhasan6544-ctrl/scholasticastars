import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      enum: ["free", "paid"],
      required: true
    },
    thumbnail: {
      type: String,
      default: ""
    },
    order: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

courseSchema.index({ order: 1 });
courseSchema.index({ isPublished: 1 });

export const Course = mongoose.model("Course", courseSchema);
