import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getEventById,
  getEventTickets,
  getCachedEvent,
  getCachedEventTickets,
} from "../api/eventApi";
import { sampleEvents } from "../data/sampleEvents";
import { createBooking } from "../api/bookingApi";
import { makePayment } from "../api/paymentApi";
import { generateTicket } from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  Lock,
  CheckCircle2,
  Ticket,
  ArrowRight,
  X,
  AlertTriangle,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react";
import CustomDropdown from "../components/CustomDropdown";
import "./EventDetails.css";

const PAYMENT_DROPDOWN_OPTIONS = [
  {
    value: "UPI",
    label: "UPI / QR Code (Google Pay, PhonePe, Paytm)",
    icon: <Smartphone size={16} color="#0284c7" />,
  },
  {
    value: "CREDIT_CARD",
    label: "Credit / Debit Card (Visa, Mastercard, RuPay)",
    icon: <CreditCard size={16} color="#7c3aed" />,
  },
  {
    value: "NET_BANKING",
    label: "Net Banking (SBI, HDFC, ICICI, Axis & more)",
    icon: <Building2 size={16} color="#059669" />,
  },
  {
    value: "CASH_AT_VENUE",
    label: "Pay at Venue (Cash / Card at Counter)",
    icon: <Banknote size={16} color="#d97706" />,
  },
];

const BANK_DROPDOWN_OPTIONS = [
  { value: "HDFC Bank", label: "HDFC Bank" },
  { value: "State Bank of India", label: "State Bank of India (SBI)" },
  { value: "ICICI Bank", label: "ICICI Bank" },
  { value: "Axis Bank", label: "Axis Bank" },
  { value: "Kotak Mahindra Bank", label: "Kotak Mahindra Bank" },
  { value: "Punjab National Bank", label: "Punjab National Bank" },
  { value: "Bank of Baroda", label: "Bank of Baroda" },
];

const getPaymentMethodIcon = (method) => {
  switch (method) {
    case "UPI":
      return Smartphone;
    case "CREDIT_CARD":
      return CreditCard;
    case "NET_BANKING":
      return Building2;
    case "CASH_AT_VENUE":
      return Banknote;
    default:
      return Smartphone;
  }
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast, showError, showWarning, showSuccess, extractErrorMessage } = useToast();

  const cachedEvent = getCachedEvent(id);
  const cachedTickets = getCachedEventTickets(id);

  const [event, setEvent] = useState(cachedEvent || null);
  const [ticketTypes, setTicketTypes] = useState(cachedTickets || []);
  const [selectedTicket, setSelectedTicket] = useState(
    cachedTickets && cachedTickets.length > 0 ? cachedTickets[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!cachedEvent);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Payment Selection States
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  const isDemo = String(event?.id || id).startsWith("demo-");

  // For real database events, clean any stale local deduction
  useEffect(() => {
    if (event && !isDemo) {
      localStorage.removeItem(`booked_seats_${event.id}`);
    }
  }, [event, isDemo]);

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    // Only set loading if no cached data was available
    if (!getCachedEvent(id)) {
      setLoading(true);
    }

    try {
      // 1. Fetch event information
      const eventRes = await getEventById(id);
      setEvent(eventRes.data);

      // 2. Fetch ticket tiers
      try {
        const ticketsRes = await getEventTickets(id);
        const tickets = ticketsRes.data || [];
        setTicketTypes(tickets);
        setSelectedTicket((prev) => prev || (tickets.length > 0 ? tickets[0] : null));
      } catch (tickErr) {
        console.warn("Could not load tickets for event", tickErr);
        setTicketTypes([]);
      }
    } catch (err) {
      console.warn("Could not fetch event from backend, checking sample events:", err);
      const fallback = sampleEvents.find((e) => String(e.id) === String(id));
      if (fallback) {
        setEvent(fallback);
        const sampleTiers = [
          { id: 101, name: "General Admission", price: 49.0, availableQuantity: 50 },
          { id: 102, name: "VIP All-Access Pass", price: 149.0, availableQuantity: 15 },
          { id: 103, name: "Early Bird Discount", price: 29.0, availableQuantity: 10 },
        ];
        setTicketTypes(sampleTiers);
        setSelectedTicket(sampleTiers[0]);
      } else {
        showError(
          err.response?.data?.message || "Failed to load event details.",
          "Load Error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "UPI":
        return "UPI";
      case "CREDIT_CARD":
        return "Credit/Debit Card";
      case "NET_BANKING":
        return "Net Banking";
      case "CASH_AT_VENUE":
        return "Pay at Venue";
      default:
        return method;
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role === "ORGANIZER" || user?.role === "ADMIN") {
      showError(
        "Organizers and Admins cannot book tickets. Please use an Attendee (USER) account.",
        "Action Prohibited"
      );
      return;
    }

    if (!selectedTicket) {
      showWarning("Please select a ticket tier", "Ticket Tier Required");
      return;
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 1) {
      showToast(
        "Cannot book with 0 tickets! Please select at least 1 ticket to proceed.",
        "warning",
        "Ticket Quantity Required"
      );
      return;
    }

    if (qtyNum > 10) {
      showToast(
        "You can book at most 10 tickets per order.",
        "warning",
        "Ticket Limit Exceeded"
      );
      return;
    }

    const tierAvailable =
      selectedTicket.availableQuantity !== undefined
        ? selectedTicket.availableQuantity
        : selectedTicket.totalQuantity;

    if (qtyNum > tierAvailable) {
      showWarning(
        `Only ${tierAvailable} ticket(s) remaining for ${selectedTicket.name}.`,
        "Limited Tickets Available"
      );
      return;
    }

    setBookingLoading(true);
    setProcessingStep(1);

    // Smooth progressive step indicators across ~2 seconds
    const timerStep2 = setTimeout(() => setProcessingStep(2), 700);
    const timerStep3 = setTimeout(() => setProcessingStep(3), 1400);

    try {
      // 1. Create booking & payment in backend with minimum 2-second loading
      const [bookingRes] = await Promise.all([
        (async () => {
          const bRes = await createBooking({
            ticketTypeId: selectedTicket.id,
            quantity: qtyNum,
          });
          await makePayment({
            bookingId: bRes.data.id,
            paymentMethod: paymentMethod,
          });
          return bRes;
        })(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      // Clear any local deduction for real DB events
      if (isDemo) {
        const currentDeduction = parseInt(
          localStorage.getItem(`booked_seats_${event.id}`) || "0",
          10
        );
        localStorage.setItem(
          `booked_seats_${event.id}`,
          String(currentDeduction + qtyNum)
        );
      } else {
        localStorage.removeItem(`booked_seats_${event.id}`);
      }

      // Immediately update local state so remaining seats reflect the booking
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              availableSeats: Math.max(
                0,
                (prev.availableSeats !== undefined
                  ? prev.availableSeats
                  : prev.totalCapacity) - qtyNum
              ),
            }
          : prev
      );

      setTicketTypes((prevList) =>
        prevList.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                availableQuantity: Math.max(
                  0,
                  (t.availableQuantity !== undefined
                    ? t.availableQuantity
                    : t.totalQuantity) - qtyNum
                ),
              }
            : t
        )
      );

      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              availableQuantity: Math.max(
                0,
                (prev.availableQuantity !== undefined
                  ? prev.availableQuantity
                  : prev.totalQuantity) - qtyNum
              ),
            }
          : prev
      );

      // Open the Confirmation Pop-Up Modal
      setConfirmedBooking({
        bookingId: bookingRes.data.id,
        bookingNumber:
          bookingRes.data.bookingNumber ||
          `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        eventName: event.title,
        venue: `${event.venue}, ${event.city}`,
        eventDate: event.eventDate,
        eventTime: `${event.startTime} - ${event.endTime}`,
        ticketTypeName: selectedTicket.name,
        quantity: qtyNum,
        totalAmount: (selectedTicket.price * qtyNum).toFixed(2),
        paymentMethod: paymentMethod,
      });
      setShowConfirmationModal(true);
    } catch (err) {
      clearTimeout(timerStep2);
      clearTimeout(timerStep3);

      // If demo mode or backend error in demo environment
      if (isDemo || !err.response) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const currentDeduction = parseInt(
          localStorage.getItem(`booked_seats_${event.id}`) || "0",
          10
        );
        localStorage.setItem(
          `booked_seats_${event.id}`,
          String(currentDeduction + qtyNum)
        );

        setEvent((prev) =>
          prev
            ? {
                ...prev,
                availableSeats: Math.max(
                  0,
                  (prev.availableSeats !== undefined
                    ? prev.availableSeats
                    : prev.totalCapacity) - qtyNum
                ),
              }
            : prev
        );

        setConfirmedBooking({
          bookingId: "demo-" + Date.now(),
          bookingNumber: `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          eventName: event.title,
          venue: `${event.venue}, ${event.city}`,
          eventDate: event.eventDate,
          eventTime: `${event.startTime} - ${event.endTime}`,
          ticketTypeName: selectedTicket.name,
          quantity: qtyNum,
          totalAmount: (selectedTicket.price * qtyNum).toFixed(2),
          paymentMethod: paymentMethod,
        });
        setShowConfirmationModal(true);
        return;
      }

      const msg = extractErrorMessage(
        err,
        "Failed to complete booking. Please check ticket availability and try again."
      );
      showError(msg, "Booking Failed");
    } finally {
      clearTimeout(timerStep2);
      clearTimeout(timerStep3);
      setBookingLoading(false);
    }
  };

  // Only demo events apply local deduction; real database events use the backend's availableSeats directly
  const localDeduction = isDemo
    ? parseInt(localStorage.getItem(`booked_seats_${id}`) || "0", 10)
    : 0;

  const eventRemainingSeats = event
    ? Math.max(
        0,
        (event.availableSeats !== undefined
          ? event.availableSeats
          : event.totalCapacity) - localDeduction
      )
    : 0;

  if (loading)
    return (
      <div className="event-details-wrapper">Loading event details...</div>
    );
  if (!event)
    return <div className="event-details-wrapper">Event not found.</div>;

  const qtyNum = parseInt(quantity, 10);
  const validQty = isNaN(qtyNum) || qtyNum < 0 ? 0 : qtyNum;
  const totalPrice = selectedTicket
    ? (selectedTicket.price * validQty).toFixed(2)
    : "0.00";

  return (
    <div className="event-details-wrapper">
      <div className="event-details-layout">
        {/* Left Column: Event Information */}
        <div className="event-main-content">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="event-hero-banner"
            />
          )}

          <div>
            <span className="event-details-category">{event.category}</span>
            <h1 className="event-details-title">{event.title}</h1>
          </div>

          <div className="event-meta-card">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <div>
                <p className="meta-label">Date & Time</p>
                <p className="meta-value">
                  {event.eventDate} ({event.startTime} - {event.endTime})
                </p>
              </div>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📍</span>
              <div>
                <p className="meta-label">Location</p>
                <p className="meta-value">
                  {event.venue}, {event.city}
                </p>
              </div>
            </div>
            <div className="meta-item">
              <span className="meta-icon">🎟️</span>
              <div>
                <p className="meta-label">Ticket Availability</p>
                <p className="meta-value">
                  {eventRemainingSeats === 0
                    ? "Sold Out (0 seats left)"
                    : `${eventRemainingSeats} of ${event.totalCapacity} seats left`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="event-section-heading">About This Event</h2>
            <p className="event-details-desc">{event.description}</p>
          </div>
        </div>

        {/* Right Column: Ticket Information for Organizers/Admins OR Booking Form for Attendees */}
        <div className="booking-card">
          {user?.role === "ORGANIZER" || user?.role === "ADMIN" ? (
            <div>
              <h2 className="booking-card-title">Ticket Tiers & Pricing</h2>
              
              {ticketTypes.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No ticket tiers added for this event yet.
                </p>
              ) : (
                <div className="ticket-type-list">
                  {ticketTypes.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="ticket-type-option"
                      style={{ cursor: "default" }}
                    >
                      <div className="ticket-type-header">
                        <span>{ticket.name}</span>
                        <span className="ticket-price">₹{ticket.price}</span>
                      </div>
                      <p className="ticket-stock">
                        Available:{" "}
                        {ticket.availableQuantity !== undefined
                          ? ticket.availableQuantity
                          : ticket.totalQuantity}{" "}
                        / {ticket.totalQuantity}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  background: "#f1f5f9",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginTop: "16px",
                  textAlign: "center",
                }}
              >
                ℹ️ Ticket booking is allowed from the user accounts.
              </div>
            </div>
          ) : (
            <>
              <h2 className="booking-card-title">Book Tickets</h2>

              {ticketTypes.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>
                  No tickets available for this event yet.
                </p>
              ) : (
                <>
                  <div className="ticket-type-list">
                    {ticketTypes.map((ticket) => {
                      const tierRemaining = Math.max(
                        0,
                        (ticket.availableQuantity !== undefined
                          ? ticket.availableQuantity
                          : ticket.totalQuantity) -
                          (isDemo && selectedTicket?.id === ticket.id ? localDeduction : 0)
                      );
                      return (
                        <div
                          key={ticket.id}
                          className={`ticket-type-option ${selectedTicket?.id === ticket.id ? "selected" : ""}`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="ticket-type-header">
                            <span>{ticket.name}</span>
                            <span className="ticket-price">₹{ticket.price}</span>
                          </div>
                          <p className="ticket-stock">
                            Available: {tierRemaining} / {ticket.totalQuantity} left
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stepper Quantity Selector (Default min 1 ticket) */}
                  <div className="booking-quantity-box">
                    <div className="qty-header-row">
                      <label htmlFor="ticket-quantity-input">Number of Tickets</label>
                      <span className="qty-badge-default">Min: 1 Ticket</span>
                    </div>

                    <div className={`qty-stepper-control ${Number(quantity) === 0 ? "qty-is-zero" : ""}`}>
                      <button
                        type="button"
                        className="btn-qty-step"
                        onClick={() => {
                          const cur = parseInt(quantity, 10) || 0;
                          if (cur <= 0) {
                            showToast(
                              "Ticket quantity is already 0. Minimum 1 ticket required to book.",
                              "warning",
                              "Ticket Quantity Limit"
                            );
                            setQuantity(0);
                          } else {
                            setQuantity(cur - 1);
                          }
                        }}
                        aria-label="Decrease ticket quantity"
                        title="Decrease tickets"
                      >
                        <Minus size={16} />
                      </button>

                      <input
                        id="ticket-quantity-input"
                        type="number"
                        min="0"
                        max="10"
                        value={quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setQuantity("");
                          } else {
                            const num = parseInt(val, 10);
                            if (!isNaN(num)) {
                              setQuantity(Math.max(0, Math.min(10, num)));
                            }
                          }
                        }}
                        className="input-qty-number"
                        placeholder="1"
                      />

                      <button
                        type="button"
                        className="btn-qty-step"
                        onClick={() => {
                          const cur = parseInt(quantity, 10) || 0;
                          if (cur >= 10) {
                            showToast(
                              "You can book a maximum of 10 tickets per order.",
                              "warning",
                              "Ticket Limit Reached"
                            );
                          } else {
                            setQuantity(cur + 1);
                          }
                        }}
                        aria-label="Increase ticket quantity"
                        title="Increase tickets"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {Number(quantity) === 0 && (
                      <div className="qty-zero-warning-banner">
                        <AlertCircle size={14} className="qty-warn-icon" />
                        <span>Ticket quantity is 0. Select at least 1 ticket to book.</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector with Modern Dropdown */}
                  <div className="payment-method-section">
                    <div className="payment-section-header">
                      <div className="payment-header-left">
                        <Lock size={15} className="pay-lock-icon" />
                        <span>Select Payment Method</span>
                      </div>
                      <span className="payment-selected-tag">Default: UPI</span>
                    </div>

                    <div className="payment-dropdown-wrapper">
                      <CustomDropdown
                        value={paymentMethod}
                        onChange={(val) => setPaymentMethod(val)}
                        label="Method:"
                        icon={getPaymentMethodIcon(paymentMethod)}
                        options={PAYMENT_DROPDOWN_OPTIONS}
                        className="payment-modern-dropdown"
                        dropdownAlign="left"
                      />
                    </div>

                    {/* Dynamic Method Sub-forms */}
                    {paymentMethod === "UPI" && (
                      <div className="payment-method-box">
                        <label className="pay-input-label">Enter UPI ID (VPA)</label>
                        <div className="pay-input-row">
                          <input
                            type="text"
                            placeholder="e.g. mobileNumber@upi or name@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="pay-text-input"
                          />
                        </div>
                        <div className="upi-fast-pills">
                          {["@okhdfcbank", "@oksbi", "@paytm", "@okaxis", "@ybl"].map((suffix) => (
                            <button
                              key={suffix}
                              type="button"
                              className="upi-pill-btn"
                              onClick={() => {
                                const base = upiId.includes("@") ? upiId.split("@")[0] : upiId;
                                const userPrefix = base || (user?.email ? user.email.split("@")[0] : "user");
                                setUpiId(userPrefix + suffix);
                              }}
                            >
                              {suffix}
                            </button>
                          ))}
                        </div>
                        <p className="pay-hint-text">
                          ⚡ Payment collect request will be pushed instantly to your UPI App (GPay / PhonePe / Paytm).
                        </p>
                      </div>
                    )}

                    {paymentMethod === "CREDIT_CARD" && (
                      <div className="payment-method-box">
                        <div className="card-input-field">
                          <label className="pay-input-label">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="Name on Card"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            className="pay-text-input"
                          />
                        </div>
                        <div className="card-input-field" style={{ marginTop: "8px" }}>
                          <label className="pay-input-label">Card Number</label>
                          <input
                            type="text"
                            maxLength={19}
                            placeholder="4532 8901 2345 6789"
                            value={cardDetails.number}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                              const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
                              setCardDetails({ ...cardDetails, number: formatted });
                            }}
                            className="pay-text-input"
                          />
                        </div>
                        <div className="card-two-col" style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                          <div style={{ flex: 1 }}>
                            <label className="pay-input-label">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="12/28"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              className="pay-text-input"
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label className="pay-input-label">CVV</label>
                            <input
                              type="password"
                              maxLength={3}
                              placeholder="•••"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                              className="pay-text-input"
                            />
                          </div>
                        </div>
                        <p className="pay-hint-text">
                          🔒 256-bit SSL encrypted secure checkout.
                        </p>
                      </div>
                    )}

                    {paymentMethod === "NET_BANKING" && (
                      <div className="payment-method-box">
                        <label className="pay-input-label">Select Your Bank</label>
                        <CustomDropdown
                          value={selectedBank}
                          onChange={(val) => setSelectedBank(val)}
                          label="Bank:"
                          icon={Building2}
                          options={BANK_DROPDOWN_OPTIONS}
                          className="bank-modern-dropdown"
                          dropdownAlign="left"
                        />
                        <p className="pay-hint-text">
                          🏦 You will be securely directed to {selectedBank} portal for authorization.
                        </p>
                      </div>
                    )}

                    {paymentMethod === "CASH_AT_VENUE" && (
                      <div className="payment-method-box venue-box">
                        <div className="venue-note">
                          <strong>💵 Pay Cash / Card at Entry Desk</strong>
                          <p>
                            Reserve your seats immediately. Present your booking QR code at the event entrance counter to pay ₹{totalPrice} and receive your entry badge.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="booking-summary">
                    <span>Total Amount:</span>
                    <span className="ticket-price">₹{totalPrice}</span>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading || eventRemainingSeats === 0}
                    className="btn-book-now"
                  >
                    {bookingLoading ? (
                      "Processing Booking..."
                    ) : (
                      <>
                        {paymentMethod === "UPI" && `Pay ₹${totalPrice} via UPI`}
                        {paymentMethod === "CREDIT_CARD" && `Pay ₹${totalPrice} with Card`}
                        {paymentMethod === "NET_BANKING" && `Pay ₹${totalPrice} via Net Banking`}
                        {paymentMethod === "CASH_AT_VENUE" && `Book & Pay ₹${totalPrice} at Venue`}
                      </>
                    )}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2-Second Realistic Processing Modal */}
      {bookingLoading && (
        <div className="processing-overlay">
          <div className="processing-modal-card">
            <div className="processing-spinner-ring"></div>
            <h3 className="processing-title">Processing Your Booking...</h3>
            <p className="processing-subtitle">
              Please wait while we secure your seats and verify payment.
            </p>

            <div className="processing-steps-list">
              <div className={`proc-step ${processingStep >= 1 ? "active" : ""}`}>
                <span className="step-badge">{processingStep > 1 ? "✓" : "1"}</span>
                <span>Connecting to payment gateway</span>
              </div>
              <div className={`proc-step ${processingStep >= 2 ? "active" : ""}`}>
                <span className="step-badge">{processingStep > 2 ? "✓" : "2"}</span>
                <span>Authorizing {getPaymentMethodLabel(paymentMethod)} (₹{totalPrice})</span>
              </div>
              <div className={`proc-step ${processingStep >= 3 ? "active" : ""}`}>
                <span className="step-badge">{processingStep >= 3 ? "✓" : "3"}</span>
                <span>Securing seats & generating QR ticket</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Pop-Up / Modal */}
      {showConfirmationModal && confirmedBooking && (
        <div className="confirmation-modal-overlay" onClick={() => setShowConfirmationModal(false)}>
          <div className="confirmation-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="confirmation-close-btn"
              onClick={() => setShowConfirmationModal(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="confirmation-hero">
              <div className="confirm-icon-circle">
                <CheckCircle2 size={44} className="confirm-icon" />
              </div>
              <span className="confirm-badge">🎉 Official Pass Confirmed</span>
              <h2 className="confirm-title">Booking Successful!</h2>
              <p className="confirm-sub">
                Your reservation is confirmed and your tickets have been generated.
              </p>
            </div>

            <div className="confirm-receipt-box">
              <div className="receipt-ref-row">
                <span className="receipt-ref-label">Booking Reference:</span>
                <span className="receipt-ref-code">#{confirmedBooking.bookingNumber}</span>
              </div>

              <div className="receipt-event-summary">
                <h4 className="receipt-event-title">{confirmedBooking.eventName}</h4>
                <p className="receipt-event-time">
                  📅 {confirmedBooking.eventDate} ({confirmedBooking.eventTime})
                </p>
                <p className="receipt-event-venue">
                  📍 {confirmedBooking.venue}
                </p>
              </div>

              <div className="receipt-breakdown">
                <div className="receipt-line">
                  <span>Ticket Tier</span>
                  <strong>{confirmedBooking.ticketTypeName}</strong>
                </div>
                <div className="receipt-line">
                  <span>Tickets</span>
                  <strong>{confirmedBooking.quantity} Seat(s)</strong>
                </div>
                <div className="receipt-line">
                  <span>Payment Mode</span>
                  <span className="receipt-method-pill">
                    {getPaymentMethodLabel(confirmedBooking.paymentMethod)}
                  </span>
                </div>
                <div className="receipt-line receipt-total-row">
                  <span>Total Amount</span>
                  <span className="receipt-total-price">₹{confirmedBooking.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="confirmation-footer-actions">
              <button
                onClick={() => navigate("/my-tickets")}
                className="btn-confirm-view"
              >
                <Ticket size={18} />
                <span>View Ticket & QR Pass</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="btn-confirm-dismiss"
              >
                Done / Stay on Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
