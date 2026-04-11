import { motion } from 'framer-motion';
import { Code, Users, Share2, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Contact', href: '#contact' },
  ];

  const socialLinks = [
    { icon: Code, href: '#', label: 'GitHub' },
    { icon: Users, href: '#', label: 'Community' },
    { icon: Share2, href: '#', label: 'Share' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="relative bg-background border-t border-border mt-16 overflow-hidden">
      {/* Soft gradient background for footer */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/30 -z-10" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Brand Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <div className="flex items-center space-x-2 mb-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-blue-600 to-indigo-600"
              >
                <span className="text-white font-bold text-lg">N</span>
              </motion.div>
              <span className="text-2xl font-extrabold text-foreground tracking-tight">NoteNest</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Your ultimate platform for discovering, sharing, and mastering academic resources. Built for students, by students.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}>
            <h4 className="text-lg font-semibold mb-6 text-foreground">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 3 }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}>
            <h4 className="text-lg font-semibold mb-6 text-foreground">Connect</h4>
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={idx}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-md bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary border border-border transition-colors shadow-sm"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }} className="border-t border-border mb-8 origin-left" />

        {/* Bottom Footer */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: true }} className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>
            © {currentYear} <span className="font-semibold text-foreground">NoteNest</span>. All rights reserved.
          </p>
          <p className="mt-4 md:mt-0 flex items-center">
            Built with <span className="text-destructive mx-1 text-base">♥</span> for knowledge seekers
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
