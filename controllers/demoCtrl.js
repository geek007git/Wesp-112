const bcrypt = require("bcryptjs");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModels");

const DEMO_PASSWORD = "DemoPass!2026";

const toDateParts = (offsetDays, hour) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, 0, 0, 0);
  return {
    date: `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`,
    time: `${String(hour).padStart(2, "0")}:00`,
    slot: date,
  };
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  isDoctor: user.isDoctor,
});

const ensureUser = async ({ name, email, isAdmin = false, isDoctor = false }) => {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  return userModel.findOneAndUpdate(
    { email },
    { $setOnInsert: { name, email, password, isAdmin, isDoctor } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const ensureDoctor = (user, details) =>
  doctorModel.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        userId: user._id,
        email: user.email,
        status: "approved",
        ...details,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

const ensureAppointment = (user, doctor, offsetDays, hour, status) => {
  const { date, time, slot } = toDateParts(offsetDays, hour);
  return appointmentModel.findOneAndUpdate(
    { userId: user._id, doctorId: doctor._id, slot },
    {
      $setOnInsert: {
        userId: user._id,
        doctorId: doctor._id,
        doctorInfo: doctor.toObject(),
        userInfo: publicUser(user),
        date,
        time,
        slot,
        status,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const seedDemoController = async (req, res, next) => {
  if (!req.adminDemoSeed && process.env.DEMO_SEED_ENABLED !== "true") {
    return res.status(404).send({ success: false, message: "Route not found" });
  }

  try {
    const admin = await ensureUser({
      name: "Demo Admin",
      email: "admin@medimate.demo",
      isAdmin: true,
    });
    const priya = await ensureUser({ name: "Priya Sharma", email: "priya@medimate.demo" });
    const arun = await ensureUser({ name: "Arun Kumar", email: "arun@medimate.demo" });
    const drMayaUser = await ensureUser({
      name: "Dr. Maya Patel",
      email: "maya@medimate.demo",
      isDoctor: true,
    });
    const drRahulUser = await ensureUser({
      name: "Dr. Rahul Menon",
      email: "rahul@medimate.demo",
      isDoctor: true,
    });
    const drNishaUser = await ensureUser({
      name: "Dr. Nisha Verma",
      email: "nisha@medimate.demo",
      isDoctor: true,
    });

    const [drMaya, drRahul, drNisha] = await Promise.all([
      ensureDoctor(drMayaUser, {
        firstName: "Maya",
        lastName: "Patel",
        phone: "+91 98765 10001",
        website: "https://medimate.demo/doctors/maya-patel",
        address: "Indiranagar, Bengaluru",
        specialization: "Cardiologist",
        experience: "12 years",
        feesPerConsultation: 900,
        timings: ["09:00", "17:00"],
      }),
      ensureDoctor(drRahulUser, {
        firstName: "Rahul",
        lastName: "Menon",
        phone: "+91 98765 10002",
        website: "https://medimate.demo/doctors/rahul-menon",
        address: "HSR Layout, Bengaluru",
        specialization: "Dermatologist",
        experience: "9 years",
        feesPerConsultation: 700,
        timings: ["10:00", "18:00"],
      }),
      ensureDoctor(drNishaUser, {
        firstName: "Nisha",
        lastName: "Verma",
        phone: "+91 98765 10003",
        website: "https://medimate.demo/doctors/nisha-verma",
        address: "Koramangala, Bengaluru",
        specialization: "Pediatrician",
        experience: "11 years",
        feesPerConsultation: 800,
        timings: ["09:00", "16:00"],
      }),
    ]);

    const appointments = await Promise.all([
      ensureAppointment(priya, drMaya, 2, 10, "approved"),
      ensureAppointment(priya, drRahul, 4, 11, "pending"),
      ensureAppointment(arun, drMaya, 3, 14, "pending"),
      ensureAppointment(arun, drNisha, 5, 10, "approved"),
    ]);

    await Promise.all([
      userModel.findByIdAndUpdate(priya._id, {
        $set: {
          notifications: [
            {
              type: "appointment-status-updated",
              message: "Your appointment with Dr. Maya Patel has been approved",
              onClickPath: "/appointments",
              data: { appointmentId: appointments[0]._id },
            },
          ],
        },
      }),
      userModel.findByIdAndUpdate(drMayaUser._id, {
        $set: {
          notifications: [
            {
              type: "new-appointment-request",
              message: "A new appointment request from Arun Kumar",
              onClickPath: "/doctor/appointments",
              data: { appointmentId: appointments[2]._id },
            },
          ],
        },
      }),
    ]);

    res.status(201).send({
      success: true,
      message: "Demo accounts, doctors, and appointments are ready",
      accounts: {
        admin: admin.email,
        patient: priya.email,
        doctor: drMayaUser.email,
        password: DEMO_PASSWORD,
      },
    });
  } catch (error) {
    next(error);
  }
};

const adminSeedDemoController = (req, res, next) => {
  req.adminDemoSeed = true;
  return seedDemoController(req, res, next);
};

module.exports = { seedDemoController, adminSeedDemoController };
