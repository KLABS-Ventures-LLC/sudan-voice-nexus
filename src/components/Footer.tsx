import { Link } from "react-router-dom";
import { Vote } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/50 mt-20">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="gradient-hero p-2 rounded-lg">
                <Vote className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">Sudan Voice Nexus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A digital parliament platform ensuring authenticated participation in democratic processes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/polls" className="hover:text-foreground transition-colors">All Polls</Link></li>
              <li><Link to="/profile" className="hover:text-foreground transition-colors">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Sudan Voice Nexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
