import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Users, Share2, Mail, Copy, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const footerLinks = [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Contact', href: '#contact' },
  ];

  const socialLinks = [
    { icon: Code, href: 'https://github.com/Mahdi767/notenest-backend', label: 'GitHub' },
    { icon: Users, href: 'https://github.com/mahdi767', label: 'Collaborator' },
    { icon: Share2, href: '#', label: 'Share', isShare: true },
    { icon: Mail, href: 'mailto:mehedi49891@gmail.com', label: 'Email' },
  ];

  const handleShare = (e) => {
    e.preventDefault();
    setIsShareModalOpen(true);
  };

  const copyToClipboard = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link.');
    });
  };

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
                    onClick={social.isShare ? handleShare : undefined}
                    target={social.href.startsWith('http') ? "_blank" : undefined}
                    rel={social.href.startsWith('http') ? "noopener noreferrer" : undefined}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-md bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary border border-border transition-colors shadow-sm cursor-pointer"
                    title={social.label}
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

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Share NoteNest</h3>
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className="p-1 rounded-full hover:bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">
                  Copy the link below to share NoteNest with your friends and classmates.
                </p>

                <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl border border-border">
                  <div className="flex-1 truncate text-sm font-medium text-foreground">
                    {window.location.origin}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-muted/30 p-4 border-t border-border flex justify-end">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}

