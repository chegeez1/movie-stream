import React from 'react'
import { Link } from 'react-router-dom'
import { Film, Heart, Github, Twitter, Mail } from 'lucide-react'
import '../../styles/components/footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <Film size={32} className="brand-icon" />
              <span className="brand-name">MovieStream</span>
            </div>
            <p className="footer-description">
              Your ultimate destination for streaming and downloading movies. 
              Discover, watch, and enjoy your favorite films in high quality.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/trending">Trending</Link></li>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/downloads">Downloads</Link></li>
              <li><Link to="/favorites">Favorites</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3 className="footer-title">Categories</h3>
            <ul className="footer-links">
              <li><a href="#">Action</a></li>
              <li><a href="#">Comedy</a></li>
              <li><a href="#">Drama</a></li>
              <li><a href="#">Sci-Fi</a></li>
              <li><a href="#">Horror</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} MovieStream. Made with <Heart size={14} /> for movie lovers.</p>
          </div>
          <div className="footer-notes">
            <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
