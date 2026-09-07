import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Ticket,
  Zap,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Heart,
  Phone,
  Mail,
} from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const { isAuthenticated, user } = useAuth();

  return (
    <footer className="footer-wrapper">
      {/* Top Banner highlight - Only for guest visitors who are not logged in */}
      {!isAuthenticated && (
        <div className="footer-highlight-banner">
          <div className="footer-container highlight-inner">
            <div className="highlight-text">
              <span className="highlight-tag">
                <Sparkles size={14} /> Next-Gen Event Platform
              </span>
              <h3>Ready to experience seamless events?</h3>
              <p>
                Join thousands of attendees and organizers discovering and managing events with zero friction.
              </p>
            </div>
            <div className="highlight-actions">
              <Link to="/register" className="btn-footer-cta">
                Create Free Account <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="footer-container footer-main">
        {/* Brand & About Us Column */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-brand">
            <img
              src="/Bridge2Event.png"
              alt="Bridge2Event"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                objectFit: "cover",
                boxShadow: "0 2px 6px rgba(99, 102, 241, 0.2)",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="footer-brand-name">Bridge2Event</span>
          </Link>
          <p className="footer-brand-desc">
            The intelligent event ticketing and management platform created by <strong>Muralidharan</strong>.
            Connecting attendees with live events and empowering organizers with instant QR gate check-ins.
          </p>

          {/* About Us & Contact Info */}
          <div className="footer-contact-block">
            <div className="footer-contact-title">Contact & Developer Info</div>
            <div className="footer-contact-items">
              <a href="tel:+918610356350" className="footer-contact-item">
                <Phone size={13} className="contact-icon" />
                <span>+91 8610356350</span>
              </a>
              <a href="mailto:md9611250@gmail.com" className="footer-contact-item">
                <Mail size={13} className="contact-icon" />
                <span>md9611250@gmail.com</span>
              </a>
            </div>
            <div className="footer-social-bar">
              <a
                href="https://github.com/Muralidharan005/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-pill"
                title="GitHub: Muralidharan005"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/muralidhar0506/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-pill"
                title="LinkedIn: muralidhar0506"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div className="footer-trust-highlights">
            <span className="footer-trust-item">
              <Zap size={14} className="trust-icon" />
              <span>Instant QR Passes</span>
            </span>
            <span className="trust-dot">•</span>
            <span className="footer-trust-item">
              <ShieldCheck size={14} className="trust-icon" />
              <span>Verified Organizers</span>
            </span>
          </div>
        </div>

        {/* Why Use This Website */}
        <div className="footer-col">
          <h4 className="footer-col-title">Why Use Bridge2Event?</h4>
          <ul className="footer-info-list">
            <li>
              <div className="info-icon">
                <QrCode size={16} />
              </div>
              <div>
                <strong>Instant QR Passes</strong>
                <p>Book tickets and get your unique digital QR pass delivered in seconds.</p>
              </div>
            </li>
            <li>
              <div className="info-icon">
                <Zap size={16} />
              </div>
              <div>
                <strong>Live Mobile Check-In</strong>
                <p>Organizers scan and verify passes at the door with any phone camera.</p>
              </div>
            </li>
            <li>
              <div className="info-icon">
                <Ticket size={16} />
              </div>
              <div>
                <strong>Multi-Tier Ticketing</strong>
                <p>Choose VIP, Early Bird, or General seats with live capacity counts.</p>
              </div>
            </li>
            <li>
              <div className="info-icon">
                <ShieldCheck size={16} />
              </div>
              <div>
                <strong>Secure & Transparent</strong>
                <p>Protected by JWT authentication with zero hidden convenience charges.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Why Bridge2Event is Better (Comparison) */}
        <div className="footer-col comparison-col">
          <h4 className="footer-col-title">Why Bridge2Event is Better</h4>
          <div className="comparison-cards">
            <div className="comparison-row comparison-better">
              <div className="comp-badge better">
                <CheckCircle2 size={16} /> Bridge2Event
              </div>
              <ul className="comp-points">
                <li>Instant tamper-proof digital passes on your phone</li>
                <li>Single-scan live camera validation (under 1 second)</li>
                <li>Live synchronized seat inventory prevents overbooking</li>
                <li>Unified dashboards for attendees, organizers & admins</li>
              </ul>
            </div>

            <div className="comparison-row comparison-traditional">
              <div className="comp-badge traditional">
                <XCircle size={16} /> Traditional Systems
              </div>
              <ul className="comp-points">
                <li>Paper tickets prone to loss, damage, and delays</li>
                <li>Slow manual paper guestlists causing gate bottlenecks</li>
                <li>Double booking risks and lagging manual counts</li>
                <li>Disjointed tools with complex verification steps</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col links-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About Us & Creator</Link>
            </li>
            <li>
              <Link to="/explore-events">Explore All Events</Link>
            </li>
            <li>
              <a href="#events">Featured Events</a>
            </li>
          </ul>
        </div>

        {/* Account / Portal Access Column */}
        <div className="footer-col links-col">
          <h4 className="footer-col-title">Portal Access</h4>
          <ul className="footer-links">
            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/login">Sign In</Link>
                </li>
                <li>
                  <Link to="/register">Create Account</Link>
                </li>
              </>
            ) : (
              <>
                {user?.role === "USER" && (
                  <li>
                    <Link to="/my-tickets">My Passes & Bookings</Link>
                  </li>
                )}
                {user?.role === "ORGANIZER" && (
                  <>
                    <li>
                      <Link to="/organizer/dashboard">Organizer Dashboard</Link>
                    </li>
                    <li>
                      <Link to="/organizer/create-event">Create Event</Link>
                    </li>
                    <li>
                      <Link to="/organizer/check-in">QR Gate Scanner</Link>
                    </li>
                  </>
                )}
                {user?.role === "ADMIN" && (
                  <>
                    <li>
                      <Link to="/admin/dashboard">Admin Panel</Link>
                    </li>
                    <li>
                      <Link to="/admin/users">Manage Users</Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Footer Bottom / Copyright */}
      <div className="footer-bottom">
        <div className="footer-container bottom-inner">
          <p className="copyright-text">
            © {new Date().getFullYear()} Bridge2Event Platform. All rights reserved. Created by Muralidharan.
          </p>
          <div className="bottom-links">
            <Link to="/about">About Us</Link>
            <span className="dot-sep">•</span>
            <a href="tel:+918610356350">+91 8610356350</a>
            <span className="dot-sep">•</span>
            <a href="mailto:md9611250@gmail.com">md9611250@gmail.com</a>
            <span className="dot-sep">•</span>
            <span className="built-with">
              Made with <Heart size={13} className="heart-icon" /> by Muralidharan
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
