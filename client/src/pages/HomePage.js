import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Input, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import http, { apiError } from "../api/http";
import DoctorCard from "../components/DoctorCard";
import "../styles/HomePage.css";

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All specialists");
  const navigate = useNavigate();

  const getDoctors = useCallback(async () => {
    try {
      const res = await http.get("/user/getAllDoctors");
      if (res.data.success) setDoctors(res.data.data);
    } catch (error) {
      message.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getDoctors();
  }, [getDoctors]);

  const specialties = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))].sort(),
    [doctors]
  );

  const visibleDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSpecialty = specialty === "All specialists" || doctor.specialization === specialty;
      const searchable = [doctor.firstName, doctor.lastName, doctor.specialization, doctor.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesSpecialty && (!query || searchable.includes(query));
    });
  }, [doctors, search, specialty]);

  return (
    <div className="home-page">
      <section className="welcome-hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR HEALTH, IN GOOD HANDS</span>
          <h1>Care that feels<br /><em>closer.</em></h1>
          <p>Find trusted specialists, compare your options, and book a time that works for you.</p>
          <a className="hero-link" href="#doctor-directory">Explore our doctors <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-illustration">
            <span className="illustration-cross">+</span>
            <span className="illustration-heart">♥</span>
          </div>
          <div className="hero-note"><span className="note-icon">✦</span><span><strong>Thoughtful care</strong><small>Starts with the right doctor</small></span></div>
          <div className="hero-stamp"><span>CARE</span><span>FOR ALL</span></div>
        </div>
        <div className="hero-bottom"><span>01 / Find your specialist</span><span>Made for your wellbeing <b>✦</b></span></div>
      </section>

      <section className="directory-section" id="doctor-directory">
        <div className="directory-heading">
          <div>
            <span className="section-kicker">THE RIGHT CARE, RIGHT HERE</span>
            <h2>Meet your care team</h2>
            <p>Browse our verified specialists and find the one that feels right.</p>
          </div>
          <div className="doctor-count"><strong>{loading ? "—" : String(doctors.length).padStart(2, "0")}</strong><span>listed<br />specialists</span></div>
        </div>

        <div className="directory-tools">
          <Input
            className="doctor-search"
            aria-label="Search doctors"
            placeholder="Search by doctor, specialty or location"
            prefix={<span className="search-symbol" aria-hidden="true">⌕</span>}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />
          <span className="directory-hint"><span className="verified-mark">✓</span> Every doctor is verified</span>
        </div>

        {!loading && specialties.length > 0 && (
          <div className="specialty-filters" aria-label="Filter by specialty">
            {["All specialists", ...specialties].map((item) => (
              <button
                key={item}
                type="button"
                className={`specialty-filter${specialty === item ? " selected" : ""}`}
                onClick={() => setSpecialty(item)}
                aria-pressed={specialty === item}
              >
                {item === "All specialists" ? "All specialists" : item}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="directory-loading"><Spin size="large" /><span>Finding your care team…</span></div>
        ) : visibleDoctors.length === 0 ? (
          <div className="directory-empty">
            <Empty description={doctors.length ? "No doctors match that search" : "No approved doctors yet"} />
          {(search || specialty !== "All specialists") && <button type="button" className="text-button" onClick={() => { setSearch(""); setSpecialty("All specialists"); }}>Clear filters</button>}
          </div>
        ) : (
          <div className="doctor-grid">
            {visibleDoctors.map((doctor, index) => (
              <DoctorCard
                doctor={doctor}
                key={doctor._id}
                accent={index % 4}
                onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
              />
            ))}
          </div>
        )}
      </section>
      <footer className="home-footer"><span>Care starts with a conversation.</span><span>Have questions? <b>Ask MediMate ✦</b></span></footer>
    </div>
  );
};

export default HomePage;
