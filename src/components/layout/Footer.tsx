import { Twitter, Linkedin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-24">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/icon-512.png"
                alt="VeroLente AI"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VeroLente AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              The world's most trusted AI-powered verification engine. Verify news, images, videos, and claims instantly with real-time analysis from global sources.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com/verolente_ai" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors" title="VeroLente AI on X/Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com/company/verolente-ai" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors" title="VeroLente AI on LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://github.com/verolente-ai" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors" title="VeroLente AI on GitHub">
                <Github className="h-4 w-4" />
              </a>
              {/* Product Hunt */}
              <a href="https://www.producthunt.com/@victor_o_brien/" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors" title="VeroLente AI on Product Hunt">
                <svg width="16" height="16" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="120" cy="120" r="120" fill="#FF6154"/>
                  <path d="M136.001 120H104V88H136.001C144.837 88 152 95.163 152 104C152 112.837 144.837 120 136.001 120Z" fill="white"/>
                  <path d="M104 120H136.001C144.837 120 152 127.163 152 136C152 144.837 144.837 152 136.001 152H104V120Z" fill="white" fillOpacity="0.6"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/verify" className="hover:text-foreground transition-colors">Verify Claim</Link></li>
              <li><Link to="/trending" className="hover:text-foreground transition-colors">Trending</Link></li>
              <li><Link to="/history" className="hover:text-foreground transition-colors">History</Link></li>
              <li><Link to="/api" className="hover:text-foreground transition-colors">API Access</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 VeroLente AI. All rights reserved. Powered by advanced AI verification technology.</p>
        </div>
      </div>
    </footer>
  );
}
