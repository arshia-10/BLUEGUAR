import { Shield, Bell, Map, Users, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { ChatbotButton } from "@/components/ChatbotButton";
import heroImage from "@/assets/hero-flood-monitoring.jpg";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const features = [
    {
      icon: Bell,
      title: "Real-Time Alerts",
      description: "Get instant notifications about flood risks in your area with AI-powered predictions"
    },
    {
      icon: Map,
      title: "Interactive Maps",
      description: "View live flood monitoring maps with GPS-tagged incident reports"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Access emergency protocols and safety recommendations during flood events"
    },
    {
      icon: Users,
      title: "Community Reporting",
      description: "Citizens can report incidents and help build a comprehensive flood database"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Advanced AI models predict flood patterns and high-risk zones"
    },
    {
      icon: Activity,
      title: "Live Monitoring",
      description: "24/7 monitoring of water levels, weather patterns, and risk indicators"
    }
  ];

  const stats = [
    { value: "98.5%", label: "Prediction Accuracy" },
    { value: "15min", label: "Alert Response Time" },
    { value: "50K+", label: "Active Users" },
    { value: "24/7", label: "Live Monitoring" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              AI-Powered Flood Monitoring & Early Warning
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-slide-up">
              Protect your community with real-time alerts, predictive analytics, and intelligent flood monitoring
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/auth?type=citizen">
                <Button size="lg" variant="hero" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              BlueGuard combines AI, IoT sensors, and community data to provide comprehensive flood monitoring
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 shadow-md">
              <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-accent-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Data Collection</h3>
              <p className="text-muted-foreground">
                IoT sensors and citizen reports feed real-time data into our AI system
              </p>
            </Card>
            
            <Card className="p-8 shadow-md">
              <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-accent-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
              <p className="text-muted-foreground">
                Machine learning models analyze patterns and predict flood risks with high accuracy
              </p>
            </Card>
            
            <Card className="p-8 shadow-md">
              <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-accent-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Alerts</h3>
              <p className="text-muted-foreground">
                Citizens and authorities receive immediate notifications to take preventive action
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Platform Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for flood prevention, monitoring, and response
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 shadow-md">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Enhance Your Community's Safety?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of communities using BlueGuard for intelligent flood monitoring
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth?type=citizen">
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">BlueGuard</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 BlueGuard. AI-Powered Flood Monitoring Platform
            </div>
          </div>
        </div>
      </footer>

      <ChatbotButton />
    </div>
  );
};

export default Landing;
