import React from "react";
import "../styles/DoctorCard.css";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DoctorCard = ({ doctor, onClick, accent = 0 }) => {
  const initials = `${doctor.firstName?.[0] || ""}${doctor.lastName?.[0] || ""}`;

  return (
    <button className={`doctor-profile-card accent-${accent}`} type="button" onClick={onClick}>
      <div className="doctor-card-topline">
        <span className="doctor-verified"><span>✓</span> VERIFIED</span>
        <span className="doctor-card-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="doctor-card-person">
        <div className="doctor-avatar" aria-hidden="true">{initials}</div>
        <div className="doctor-identity">
          <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
          <span>{doctor.specialization}</span>
        </div>
      </div>
      <div className="doctor-card-divider" />
      <div className="doctor-card-details">
        <div className="doctor-detail">
          <span className="detail-icon" aria-hidden="true">✳</span>
          <span><small>EXPERIENCE</small><strong>{doctor.experience || "Experienced"}</strong></span>
        </div>
        <div className="doctor-detail">
          <span className="detail-icon location-icon" aria-hidden="true">⌖</span>
          <span><small>CLINIC</small><strong>{doctor.address || "Location available on booking"}</strong></span>
        </div>
        <div className="doctor-detail">
          <span className="detail-icon" aria-hidden="true">◷</span>
          <span><small>CLINIC HOURS</small><strong>{doctor.timings?.join(" – ") || "Hours available on booking"}</strong></span>
        </div>
      </div>
      <div className="doctor-card-bottom">
        <div><small>CONSULTATION</small><strong>{currency.format(Number(doctor.feesPerConsultation) || 0)}</strong></div>
        <span className="doctor-book-link">Book a visit <span aria-hidden="true">→</span></span>
      </div>
    </button>
  );
};

export default DoctorCard;
