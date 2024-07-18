import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtTokens.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
    nic,
    dob,
    gender,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !role ||
    !nic ||
    !dob ||
    !gender
  ) {
    return next(new ErrorHandler("Please Fill Full Form", 400));
  }
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User Already Restered", 400));
  }

  user = User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
    nic,
    dob,
    gender,
  });
  generateToken(user, "User Registered Successfully", 200, res);
});

//LOGIN
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;
  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please Provide Complete Information", 400));
  }

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password and ConfirmPassword do not Match", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Password Or Email", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password Or Email", 400));
  }
  if (role != user.role) {
    return next(new ErrorHandler("User with this role not found", 400));
  }
  generateToken(user, "User Logged In Successfully", 200, res);
});

//ADD NEW ADMIN

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, nic, dob, gender } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !nic ||
    !dob ||
    !gender
  ) {
    return next(new ErrorHandler("Please Fill Full Form", 400));
  }
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} With this email already exist`,
        400
      )
    );
  }
  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    nic,
    dob,
    gender,
    role: "Admin",
  });
  res.status(200).json({
    success: true,
    message: "New Admin Added Successfully",
  });
});

//GET ALL DOCTORS
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

//GET USER DETAILS
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const users = req.user;
  res.status(200).json({
    success: true,
    users,
  });
});

//LOGOUT ADMIN

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("adinToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Admin Logout Successfully",
    });
});

//LOGOUT Patient

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Patient Logout Successfully",
    });
});

// /ADD NEW DOCTOR

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }
  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    nic,
    dob,
    gender,
    doctorDepartment,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !nic ||
    !dob ||
    !gender ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please Provide Full Details", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} already registered with this email!`,
        400
      )
    );
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    docAvatar.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown cloudinary Error"
    );
  }
  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    nic,
    dob,
    gender,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_ic: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});
