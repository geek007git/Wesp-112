import React from "react";

const DoctorCard = ({ doctor, onClick }) => (
  <div className="card doctor-card" onClick={onClick}>
    <div className="card-header">
      Dr. {doctor.firstName} {doctor.lastName}
    </div>
    <div className="card-body">
      <p>
        <b>Specialization:</b> {doctor.specialization}
      </p>
      <p>
        <b>Experience:</b> {doctor.experience}
      </p>
      <p>
        <b>Fees Per Consultation:</b> {doctor.feesPerConsultation}
      </p>
      <p>
        <b>Timings:</b> {doctor.timings && doctor.timings.join(" - ")}
      </p>
    </div>
  </div>
);

export default DoctorCard;
