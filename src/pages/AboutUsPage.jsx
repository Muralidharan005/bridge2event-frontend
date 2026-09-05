import React from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  Zap,
  ShieldCheck,
  QrCode,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  ArrowRight,
  Code2,
  Database,
  Layers,
  Award,
} from "lucide-react";
import "./AboutUs.css";

export default function AboutUsPage() {
  return (
    <div className="about-page-root">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <div className="about-hero-badge">
            <Sparkles size={14} /> About Bridge2Event
          </div>
          <h1 className="about-hero-title">
            Empowering Seamless Events & <br />
            <span>Instant Digital Ticketing</span>
          </h1>
          <p className="about-hero-subtitle">
            Bridge2Event is a high-performance event management and ticketing platform
            engineered to connect attendees with memorable experiences and equip
            organizers with real-time gate management.
          </p>
          <div className="about-hero-actions">
            <Link to="/explore-events" className="btn-about-primary">
              <Ticket size={16} />
              <span>Explore Live Events</span>
            </Link>
            <a href="#contact" className="btn-about-secondary">
              <Phone size={16} />
              <span>Contact the Creator</span>
            </a>
          </div>
        </div>
      </section>

      {/* Platform Features / What We Do */}
      <section className="about-features-section">
        <div className="about-container">
          <div className="section-header-center">
            <span className="section-badge">Platform Highlights</span>
            <h2>Engineered for Scale, Speed & Trust</h2>
            <p>
              Built from the ground up to solve common bottlenecks in event discovery,
              booking workflows, and gate admissions.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box icon-purple">
                <QrCode size={24} />
              </div>
              <h3>Encrypted QR Passes</h3>
              <p>
                Every booking generates a tamper-proof digital QR code ticket that attendees
                can save and present on any mobile device for rapid entry.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box icon-indigo">
                <Zap size={24} />
              </div>
              <h3>Sub-Second Gate Check-In</h3>
              <p>
                Organizers scan attendee passes in real time using any standard phone camera,
                instantly validating entries and preventing pass duplication.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box icon-emerald">
                <Layers size={24} />
              </div>
              <h3>Multi-Tier Seat Inventory</h3>
              <p>
                Live seat counters and categorized tickets (VIP, General, Early Bird)
                synchronize dynamically with PostgreSQL transactions to prevent overbooking.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box icon-amber">
                <ShieldCheck size={24} />
              </div>
              <h3>Role-Based Security</h3>
              <p>
                Strict role separation (Attendees, Organizers, Administrators) secured by
                JWT authentication and Spring Security access policies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Architecture Spotlight */}
      <section className="about-tech-section">
        <div className="about-container">
          <div className="tech-card-wrapper">
            <div className="tech-info">
              <span className="section-badge">Modern Tech Stack</span>
              <h2>Powered by Enterprise-Ready Technologies</h2>
              <p>
                Bridge2Event combines a reactive, responsive frontend with a resilient,
                secure Java Spring Boot backend and relational PostgreSQL persistence.
              </p>
              <div className="tech-badges-list">
                <div className="tech-badge">
                  <Code2 size={16} />
                  <span>React 19 + Vite</span>
                </div>
                <div className="tech-badge">
                  <Layers size={16} />
                  <span>Spring Boot 4 / Java 21</span>
                </div>
                <div className="tech-badge">
                  <Database size={16} />
                  <span>PostgreSQL & JPA</span>
                </div>
                <div className="tech-badge">
                  <ShieldCheck size={16} />
                  <span>Spring Security & JWT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Profile & Contact Section */}
      <section className="about-contact-section" id="contact">
        <div className="about-container">
          <div className="contact-card-main">
            <div className="contact-header">
              <div className="creator-avatar">
                <span>M</span>
              </div>
              <div className="creator-meta">
                <span className="creator-badge">
                  <Award size={13} /> Project Creator & Full-Stack Developer
                </span>
                <h2>Muralidharan</h2>
                <p className="creator-bio">
                  Passionate Software Engineer dedicated to crafting robust, accessible,
                  and scalable web platforms with elegant user experiences and rock-solid
                  backend architectures.
                </p>
              </div>
            </div>

            <hr className="contact-divider" />

            <div className="contact-details-grid">
              {/* Phone */}
              <a href="tel:+918610356350" className="contact-item-card">
                <div className="contact-item-icon icon-phone">
                  <Phone size={20} />
                </div>
                <div className="contact-item-text">
                  <span className="contact-label">Phone & WhatsApp</span>
                  <span className="contact-val">+91 8610356350</span>
                </div>
              </a>

              {/* Email */}
              <a href="mailto:md9611250@gmail.com" className="contact-item-card">
                <div className="contact-item-icon icon-email">
                  <Mail size={20} />
                </div>
                <div className="contact-item-text">
                  <span className="contact-label">Direct Email</span>
                  <span className="contact-val">md9611250@gmail.com</span>
                </div>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/Muralidharan005/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-item-card"
              >
                <div className="contact-item-icon icon-github">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <div className="contact-item-text">
                  <span className="contact-label">GitHub Profile</span>
                  <span className="contact-val">github.com/Muralidharan005</span>
                </div>
                <ExternalLink size={15} className="external-arrow" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/muralidhar0506/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-item-card"
              >
                <div className="contact-item-icon icon-linkedin">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
                  </svg>
                </div>
                <div className="contact-item-text">
                  <span className="contact-label">LinkedIn Profile</span>
                  <span className="contact-val">linkedin.com/in/muralidhar0506</span>
                </div>
                <ExternalLink size={15} className="external-arrow" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
