import { Shield, Twitter, Facebook, Linkedin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-24">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TruthLens AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              The world's most trusted AI-powered verification engine. Verify news, images, videos, and claims instantly with real-time analysis from global sources.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors">
                <Github className="h-4 w-4" />
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
          <p>&copy; 2026 TruthLens AI. All rights reserved. Powered by advanced AI verification technology.</p>
        </div>
      </div>
    </footer>
  );
}
