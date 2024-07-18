import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: [3, "First Name must be of 3 character"],
  },
  lastName: {
    type: String,
    required: true,
    minLength: [3, "Last Name must be of 3 character"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Please Provide a valid Email"],
  },
  phone: {
    type: String,
    required: true,
    minLength: [10, "Phone Number must be of 10 digit"],
    maxLength: [10, "Phone Number must be of 10 digit"],
  },
  message: {
    type: String,
    required: true,
    minLength: [10, "Message must be of 10 character"],
  },
});

export const Message = mongoose.model("Message", messageSchema);
