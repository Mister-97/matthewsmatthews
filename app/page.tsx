export default function Home() {
  return (
    <>
      {/* NAV */}
      <nav aria-label="Main navigation">
        <div className="nav-logo">
          <a href="#hero"><img src="https://i.ibb.co/0yhg1SMc/matthews-property-logo.png" alt="Matthews & Matthews Property Investment & Management" /></a>
        </div>
        <ul className="nav-links">
          <li><a href="#services">Services</a></li>
          <li><a href="#portal">Tenant</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="/login" className="nav-cta">Tenant Login</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h1>Your Home,<br /><em>Expertly Managed.</em></h1>
          <p>We take the stress out of owning and renting property. At Matthews &amp; Matthews, you can count on honest communication, well-kept homes, and a team that actually picks up the phone.</p>
          <a href="/login" className="hero-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Access Tenant Portal
          </a>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <div className="features-strip">
        <div className="feat-item">
          <div className="feat-icon">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </div>
          <span className="feat-num">55+</span>
          <span className="feat-label">Years Experience</span>
        </div>
        <div className="feat-item">
          <div className="feat-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
          <span className="feat-num">Easy</span>
          <span className="feat-label">Online Tenant Portal</span>
        </div>
        <div className="feat-item">
          <div className="feat-icon">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <span className="feat-num">Quality</span>
          <span className="feat-label">Well-Maintained Homes</span>
        </div>
      </div>

      {/* SERVICES CARDS */}
      <div className="cards-section" id="services">
        <div className="section-title">
          <h2>What We <em>Take Care Of</em></h2>
          <p>From finding the right tenant to keeping properties in great shape. We handle it all.</p>
        </div>
        <div className="cards-grid">
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            </div>
            <h3>Easy Rent Payments</h3>
            <p>Pay rent online anytime through the secure tenant portal. No checks, no hassle.</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
            </div>
            <h3>Maintenance Requests</h3>
            <p>Submit and track maintenance requests from your phone. We respond fast.</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            </div>
            <h3>Lease Management</h3>
            <p>Access your lease documents, renewal info, and important notices all in one place.</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <h3>Direct Communication</h3>
            <p>Message your property manager directly. No phone tag, no waiting around.</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </div>
            <h3>Quality Properties</h3>
            <p>We maintain every property to a high standard so you can feel at home from day one.</p>
          </div>
          <div className="card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <h3>Responsive Team</h3>
            <p>Real people who care. We&apos;re here to make your rental experience a great one.</p>
          </div>
        </div>
      </div>

      {/* TENANT PORTAL CTA */}
      <section id="portal">
        <div className="portal-inner">
          <div className="portal-badge">Current Tenants</div>
          <h2>Everything You Need,<br /><em>All in One Place</em></h2>
          <p>Log into your tenant portal to pay rent, submit maintenance requests, view your lease, and message your property manager. Anytime, from any device.</p>
          <div className="portal-features">
            <div className="pf-tag">
              <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              Pay Rent Online
            </div>
            <div className="pf-tag">
              <svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
              Maintenance Requests
            </div>
            <div className="pf-tag">
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              View Lease Docs
            </div>
            <div className="pf-tag">
              <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Message Manager
            </div>
            <div className="pf-tag">
              <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
              Payment History
            </div>
          </div>
          <a href="/login" className="btn-portal-big">
            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Go to Tenant Portal
          </a>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <h2>Get in Touch</h2>
        <p>Have a question or want to learn about available properties? We&apos;d love to hear from you.</p>
        <div className="contact-cards">
          <div className="cc">
            <div className="cc-icon">
              <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            </div>
            <h4>Phone</h4>
            <p><a href="tel:3307196908">330-719-6908</a></p>
          </div>
          <div className="cc">
            <div className="cc-icon">
              <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </div>
            <h4>Email</h4>
            <p><a href="mailto:info@matthewsandmatthews.com">info@matthewsandmatthews.com</a></p>
          </div>
          <div className="cc">
            <div className="cc-icon">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <h4>Hours</h4>
            <p>Mon to Fri<br />9 AM to 6 PM</p>
          </div>
        </div>
        <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3523.1!2d-82.4588!3d27.9506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2c43a27696dc1%3A0x7a0d5ec9a3e87f0!2s400+N+Ashley+Dr%2C+Tampa%2C+FL+33602!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
            width="100%" height="380" style={{ border: 0, display: "block" }}
            allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo"><img src="https://i.ibb.co/0yhg1SMc/matthews-property-logo.png" alt="Matthews & Matthews Property Investment & Management" /></div>
        <p>&copy; 2025 Matthews &amp; Matthews Property Investment &amp; Management &middot; All rights reserved</p>
        <p style={{ marginTop: "0.4rem" }}>
          <a href="#services">Services</a> &nbsp;&middot;&nbsp;
          <a href="#portal">Tenant Portal</a> &nbsp;&middot;&nbsp;
          <a href="#contact">Contact</a> &nbsp;&middot;&nbsp;
          <a href="/login">Login</a>
        </p>
      </footer>
    </>
  );
}
