import React, { useCallback, useEffect, useState } from "react";
import { DatePicker, TimePicker, message, Spin } from "antd";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import http from "../api/http";

const DATE_FORMAT = "DD-MM-YYYY";
const TIME_FORMAT = "HH:mm";

const BookingPage = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const getDoctor = useCallback(async () => {
    try {
      const res = await http.get(`/doctor/getDoctorById/${doctorId}`);
      if (res.data.success) {
        setDoctor(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Unable to load doctor");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    getDoctor();
  }, [getDoctor]);

  // any change to date/time invalidates a previous availability check
  const resetAvailability = () => setIsAvailable(false);

  const handleAvailability = async () => {
    if (!date || !time) {
      return message.error("Pick a date and time first");
    }
    try {
      const res = await http.post("/user/booking-availbility", {
        doctorId,
        date,
        time,
      });
      setIsAvailable(res.data.success);
      if (res.data.success) {
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Something Went Wrong");
    }
  };

  const handleBooking = async () => {
    if (!isAvailable) {
      return message.error("Check availability before booking");
    }
    try {
      const res = await http.post("/user/book-appointment", {
        doctorId,
        date,
        time,
      });
      if (res.data.success) {
        message.success(res.data.message);
        setIsAvailable(false);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Something Went Wrong");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", padding: 40 }}>
        <Spin />
      </div>
    );
  }

  if (!doctor) {
    return <h4 className="text-center">Doctor not found</h4>;
  }

  return (
    <>
      <h3 className="text-center">Booking Page</h3>
      <div className="card p-3" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h4>
          Dr. {doctor.firstName} {doctor.lastName}
        </h4>
        <p>
          <b>Specialization:</b> {doctor.specialization}
        </p>
        <p>
          <b>Fees Per Consultation:</b> {doctor.feesPerConsultation}
        </p>
        <p>
          <b>Timings:</b> {doctor.timings.join(" - ")}
        </p>
        <div className="d-flex flex-column w-50">
          <DatePicker
            className="m-2"
            format={DATE_FORMAT}
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
            onChange={(value) => {
              resetAvailability();
              setDate(value ? value.format(DATE_FORMAT) : null);
            }}
          />
          <TimePicker
            className="m-2"
            format={TIME_FORMAT}
            minuteStep={30}
            onChange={(value) => {
              resetAvailability();
              setTime(value ? value.format(TIME_FORMAT) : null);
            }}
          />
          <button className="btn btn-primary mt-2" onClick={handleAvailability}>
            Check Availability
          </button>
          <button
            className="btn btn-dark mt-2"
            onClick={handleBooking}
            disabled={!isAvailable}
          >
            Book Now
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
