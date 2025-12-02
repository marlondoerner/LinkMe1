/*
 * Zweck: Landing-Page / Startseite.
 * Kurz: Präsentationsseite mit Call-to-Action zur App (animierte UI).
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Link2, Globe } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  // Rendern der Landing-Page mit animiertem Hintergrund und CTA
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full glass-card glow-border mb-4">
              <Globe className="w-16 h-16 text-primary animate-spin-slow" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-6 neon-text"
          >
            LinkMe
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2xl md:text-3xl text-primary mb-4"
          >
            One Number, All Links
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Connect with anyone using just a 4-digit number. Share all your social links and mark your locations on an interactive global map.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="glass-card p-6 rounded-xl hover:glow-border transition-all">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Location Sharing</h3>
              <p className="text-muted-foreground">Mark your locations on a global map for others to discover</p>
            </div>

            <div className="glass-card p-6 rounded-xl hover:glow-border transition-all">
              <Link2 className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Your Links</h3>
              <p className="text-muted-foreground">Connect all your social media profiles in one place</p>
            </div>

            <div className="glass-card p-6 rounded-xl hover:glow-border transition-all">
              <Globe className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global Network</h3>
              <p className="text-muted-foreground">Find and connect with people worldwide</p>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5, type: "spring" }}
          >
            <Button
              onClick={() => navigate("/app")}
              size="lg"
              className="text-xl px-12 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all glow-border"
            >
              Enter The World
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
