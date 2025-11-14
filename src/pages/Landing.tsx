import { motion, useInView, useAnimation } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Shield,
  Bell,
  Map,
  Users,
  TrendingUp,
  Activity,
  Database,
  Brain,
  AlertTriangle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  ArrowRight,
  Droplets,
  CloudRain,
  Wind,
  Thermometer,
  MapPin,
  Clock,
  CheckCircle,
  Zap,
  Globe,
  Radio,
  Heart,
  Target,
  BarChart3,
  Smartphone,
  Satellite,
  AlertCircle,
  Home,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-flood-monitoring.jpg";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const Landing = () => {
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const analyticsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const alertsRef = useRef(null);
  const safetyRef = useRef(null);
  const mapRef = useRef(null);
  const successRef = useRef(null);

  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const analyticsInView = useInView(analyticsRef, { once: true, margin: "-100px" });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" });
  const alertsInView = useInView(alertsRef, { once: true, margin: "-100px" });
  const safetyInView = useInView(safetyRef, { once: true, margin: "-100px" });
  const mapInView = useInView(mapRef, { once: true, margin: "-100px" });
  const successInView = useInView(successRef, { once: true, margin: "-100px" });

  // Animated counter hook
  const useCountUp = (end: number, start = 0, duration = 2000, inView: boolean, decimals = 0) => {
    const [count, setCount] = useState(start);

    useEffect(() => {
      if (!inView) return;
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = progress * (end - start) + start;
        setCount(decimals > 0 ? parseFloat(value.toFixed(decimals)) : Math.floor(value));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, [inView, end, start, duration, decimals]);

    return count;
  };

  const accuracyCount = useCountUp(98.5, 0, 2000, statsInView, 1);
  const usersCount = useCountUp(50, 0, 2000, statsInView);
  const livesSavedCount = useCountUp(1250, 0, 2000, successInView);
  const alertsCount = useCountUp(8500, 0, 2000, alertsInView);

  const stats = [
    { value: `${accuracyCount}%`, label: "PREDICTION ACCURACY", icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
    { value: "15min", label: "ALERT RESPONSE TIME", icon: Bell, color: "from-cyan-500 to-teal-500" },
    { value: `${usersCount}K+`, label: "ACTIVE USERS", icon: Users, color: "from-teal-500 to-green-500" },
    { value: "24/7", label: "LIVE MONITORING", icon: Activity, color: "from-green-500 to-emerald-500" },
  ];

  const features = [
    {
      icon: Bell,
      title: "Real-Time Alerts",
      description: "Get instant notifications about flood risks in your area with AI-powered predictions",
      color: "from-blue-500 to-cyan-500",
      hoverColor: "hover:from-blue-600 hover:to-cyan-600",
    },
    {
      icon: Map,
      title: "Interactive Maps",
      description: "View live flood monitoring maps with GPS-tagged incident reports",
      color: "from-cyan-500 to-teal-500",
      hoverColor: "hover:from-cyan-600 hover:to-teal-600",
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Access emergency protocols and safety recommendations during flood events",
      color: "from-teal-500 to-green-500",
      hoverColor: "hover:from-teal-600 hover:to-green-600",
    },
    {
      icon: Users,
      title: "Community Reporting",
      description: "Citizens can report incidents and help build a comprehensive flood database",
      color: "from-green-500 to-emerald-500",
      hoverColor: "hover:from-green-600 hover:to-emerald-600",
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Advanced AI models predict flood patterns and high-risk zones",
      color: "from-emerald-500 to-blue-500",
      hoverColor: "hover:from-emerald-600 hover:to-blue-600",
    },
    {
      icon: Activity,
      title: "Live Monitoring",
      description: "24/7 monitoring of water levels, weather patterns, and risk indicators",
      color: "from-blue-500 to-indigo-500",
      hoverColor: "hover:from-blue-600 hover:to-indigo-600",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: Database,
      title: "Data Collection",
      description: "IoT sensors and citizen reports feed real-time data into our AI system",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      step: 2,
      icon: Brain,
      title: "AI Analysis",
      description: "Machine learning models analyze patterns and predict flood risks with high accuracy",
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      step: 3,
      icon: AlertTriangle,
      title: "Instant Alerts",
      description: "Citizens and authorities receive immediate notifications to take preventive action",
      gradient: "from-teal-500 to-green-500",
    },
  ];

  const testimonials = [
    {
      name: "District Officer",
      location: "Kerala",
      quote: "BlueGuard helped us respond 2x faster during heavy rainfall in our district. The real-time alerts saved countless lives.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kerala",
    },
    {
      name: "City Administrator",
      location: "Mumbai",
      quote: "The predictive analytics feature is incredible. We can now prepare for floods days in advance, minimizing damage significantly.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mumbai",
    },
    {
      name: "Community Leader",
      location: "Assam",
      quote: "Our community feels safer knowing that BlueGuard is monitoring flood risks 24/7. The platform is user-friendly and reliable.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Assam",
    },
    {
      name: "Emergency Response Team",
      location: "West Bengal",
      quote: "The instant alerts and detailed maps help us coordinate rescue operations efficiently. BlueGuard is a game-changer.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=WestBengal",
    },
  ];

  // Real-time flood alerts data
  const floodAlerts = [
    { location: "Kerala - Zone A", risk: "High", time: "2 min ago", status: "active" },
    { location: "Mumbai - Coastal", risk: "Medium", time: "15 min ago", status: "active" },
    { location: "Assam - River Basin", risk: "Low", time: "1 hour ago", status: "monitoring" },
    { location: "West Bengal - Delta", risk: "High", time: "5 min ago", status: "active" },
  ];

  // Flood safety tips
  const safetyTips = [
    { icon: Home, title: "Stay Indoors", description: "Avoid going outside during flood warnings. Move to higher ground if necessary." },
    { icon: Radio, title: "Stay Informed", description: "Listen to local news and weather updates. Follow official evacuation orders." },
    { icon: Droplets, title: "Avoid Flood Water", description: "Never walk or drive through flood water. It may be deeper than it appears." },
    { icon: Smartphone, title: "Keep Devices Charged", description: "Ensure your phone and other devices are fully charged for emergencies." },
    { icon: MapPin, title: "Know Your Evacuation Route", description: "Plan and practice your evacuation route before floods occur." },
    { icon: Heart, title: "Check on Neighbors", description: "Help elderly or disabled neighbors prepare for potential flooding." },
  ];

  // Success stories
  const successStories = [
    {
      title: "Kerala Flood Rescue 2024",
      description: "Early warning system alerted 15,000 residents, enabling timely evacuation",
      saved: "1,250+ lives",
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Mumbai Monsoon Preparedness",
      description: "Predictive analytics helped city authorities prepare 3 days in advance",
      saved: "₹50M+ in damages prevented",
      icon: Shield,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Assam River Monitoring",
      description: "Real-time sensor data prevented flooding in 8 districts",
      saved: "500+ homes protected",
      icon: Satellite,
      gradient: "from-cyan-500 to-teal-500",
    },
  ];

  // Weather data
  const weatherData = [
    { day: "Mon", rainfall: 25, waterLevel: 30 },
    { day: "Tue", rainfall: 35, waterLevel: 40 },
    { day: "Wed", rainfall: 45, waterLevel: 50 },
    { day: "Thu", rainfall: 60, waterLevel: 65 },
    { day: "Fri", rainfall: 75, waterLevel: 80 },
    { day: "Sat", rainfall: 85, waterLevel: 90 },
    { day: "Sun", rainfall: 70, waterLevel: 75 },
  ];

  // Dummy data for predictive analytics chart
  const floodData = [
    { day: "Mon", risk: 25, probability: 30 },
    { day: "Tue", risk: 35, probability: 40 },
    { day: "Wed", risk: 45, probability: 50 },
    { day: "Thu", risk: 60, probability: 65 },
    { day: "Fri", risk: 75, probability: 80 },
    { day: "Sat", risk: 85, probability: 90 },
    { day: "Sun", risk: 70, probability: 75 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-teal-950/20" />
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10"
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10"
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -40, 40, 0],
              scale: [1, 1.1, 1.2, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold shadow-sm"
              >
                AI-Powered Early Warning System
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
              >
                AI-Powered Flood Monitoring &{" "}
                <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Early Warning
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-muted-foreground max-w-xl"
              >
                Protect your community with real-time alerts, predictive analytics, and intelligent flood monitoring
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/auth?type=citizen">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 group">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                  >
                    Learn More
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <img 
                  src={heroImage} 
                  alt="Flood Monitoring - AI-Powered Early Warning System" 
                  className="w-full h-[500px] object-cover"
                />
                {/* Glassmorphism overlay for better text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              </motion.div>
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500 rounded-full blur-xl opacity-30 dark:opacity-20"
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-cyan-500 rounded-full blur-xl opacity-30 dark:opacity-20"
                animate={{
                  y: [0, 20, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 md:py-16 bg-white dark:bg-gray-900 border-y">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="p-6 text-center hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 border-2 hover:border-primary/50 group cursor-pointer bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/20">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                    </motion.div>
                    <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Real-Time Alerts Section */}
      <section ref={alertsRef} className="py-16 md:py-24 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={alertsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-block px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-semibold mb-4">
              <Bell className="inline h-4 w-4 mr-2 animate-pulse" />
              Live Alerts
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Real-Time Flood Alerts
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay informed with instant notifications about flood risks in your area
            </p>
            <div className="mt-4 text-2xl font-bold text-primary">
              {alertsCount.toLocaleString()}+ Alerts Sent This Month
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={alertsInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto"
          >
            {floodAlerts.map((alert, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className={`p-5 border-2 transition-all duration-300 ${
                  alert.risk === "High" 
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20 hover:shadow-red-500/20" 
                    : alert.risk === "Medium"
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 hover:shadow-yellow-500/20"
                    : "border-blue-500 bg-blue-50 dark:bg-blue-950/20 hover:shadow-blue-500/20"
                } hover:shadow-xl`}>
                  <div className="flex items-start justify-between mb-3">
                    <MapPin className={`h-5 w-5 ${
                      alert.risk === "High" ? "text-red-500" : alert.risk === "Medium" ? "text-yellow-500" : "text-blue-500"
                    }`} />
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      alert.risk === "High"
                        ? "bg-red-500 text-white"
                        : alert.risk === "Medium"
                        ? "bg-yellow-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}>
                      {alert.risk}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{alert.location}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {alert.time}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              BlueGuard combines AI, IoT sensors, and community data to provide comprehensive flood monitoring
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
            className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto"
          >
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group relative"
                >
                  <Card className="p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/10 relative overflow-hidden">
                    {/* Animated background gradient */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <div className="relative z-10">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                      >
                        <span className="text-2xl font-bold text-white absolute">{step.step}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-10 w-10 text-primary mb-4" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Interactive Flood Risk Map Section */}
      <section ref={mapRef} className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mapInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Interactive Flood Risk Map
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Visualize real-time flood risks across different regions with our interactive mapping system
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={mapInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="p-6 md:p-8 hover:shadow-2xl transition-all duration-300 border-2 overflow-hidden relative group">
              <div className="relative h-[500px] bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950 rounded-lg overflow-hidden">
                {/* Map placeholder with animated elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Map className="h-32 w-32 text-primary/20" />
                </div>
                {/* Animated risk zones */}
                {[
                  { x: "20%", y: "30%", risk: "High", color: "red" },
                  { x: "60%", y: "50%", risk: "Medium", color: "yellow" },
                  { x: "40%", y: "70%", risk: "Low", color: "blue" },
                ].map((zone, index) => (
                  <motion.div
                    key={index}
                    className={`absolute w-20 h-20 rounded-full bg-${zone.color}-500 opacity-30 blur-xl`}
                    style={{ left: zone.x, top: zone.y }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  />
                ))}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <span className="text-sm font-medium">High Risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        <span className="text-sm font-medium">Medium Risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">Low Risk</span>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg">
                      View Full Map
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section ref={featuresRef} className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Platform Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for flood prevention, monitoring, and response
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group"
                >
                  <Card className="p-6 h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/20 relative overflow-hidden">
                    {/* Hover gradient effect */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Predictive Analytics Section */}
      <section ref={analyticsRef} className="py-16 md:py-24 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={analyticsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Predictive Analytics
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI models visualize flood probability in real time
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={analyticsInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-6 md:p-8 hover:shadow-2xl transition-all duration-300 border-2">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={floodData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProbability" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                    name="Flood Risk %"
                  />
                  <Area
                    type="monotone"
                    dataKey="probability"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#colorProbability)"
                    name="Probability %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Weather Data Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={analyticsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl mx-auto mt-8"
          >
            <Card className="p-6 md:p-8 hover:shadow-xl transition-all duration-300 border-2">
              <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-primary" />
                Weather & Water Level Forecast
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="rainfall" fill="#0ea5e9" name="Rainfall (mm)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="waterLevel" fill="#06b6d4" name="Water Level (cm)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Flood Safety Tips Section */}
      <section ref={safetyRef} className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={safetyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Flood Safety Tips
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Essential safety guidelines to protect yourself and your family during floods
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={safetyInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {safetyTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5, rotate: 1 }}
                  className="group"
                >
                  <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/10">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg"
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section ref={successRef} className="py-16 md:py-24 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={successInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real impact from communities using BlueGuard
            </p>
            <div className="mt-4 text-3xl font-bold text-primary">
              {livesSavedCount.toLocaleString()}+ Lives Saved
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={successInView ? "visible" : "hidden"}
            className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {successStories.map((story, index) => {
              const Icon = story.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group"
                >
                  <Card className="p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/10 relative overflow-hidden">
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${story.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />
                    <div className="relative z-10">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`w-16 h-16 bg-gradient-to-br ${story.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-3 text-foreground">{story.title}</h3>
                      <p className="text-muted-foreground mb-4">{story.description}</p>
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <CheckCircle className="h-5 w-5" />
                        <span>{story.saved}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Trusted by Communities
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about BlueGuard
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5, rotate: 0.5 }}
                className="group"
              >
                <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 flex flex-col bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={testimonialsInView ? { scale: 1 } : {}}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    className="text-4xl text-primary mb-4"
                  >
                    "
                  </motion.div>
                  <p className="text-muted-foreground mb-6 flex-grow italic group-hover:text-foreground transition-colors">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <motion.img
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full border-2 border-primary/20"
                    />
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary via-accent to-primary text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h2
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            >
              Ready to Enhance Your Community's Safety?
            </motion.h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of communities using BlueGuard for intelligent flood monitoring
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/auth?type=citizen">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-white text-primary hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 group"
                >
                  Join Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">BlueGuard</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-Powered Flood Monitoring Platform
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+91 1800-BLUE-GUARD</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>support@blueguard.in</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </motion.a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            © 2024 BlueGuard. AI-Powered Flood Monitoring Platform. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
