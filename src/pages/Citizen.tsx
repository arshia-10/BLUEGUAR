import { Bell, MapPin, AlertTriangle, CheckCircle, Camera, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatbotButton } from "@/components/ChatbotButton";

const Citizen = () => {
  const alerts = [
    { id: 1, severity: "high", location: "Downtown District", message: "Heavy rainfall expected. Flood risk elevated.", time: "5 mins ago" },
    { id: 2, severity: "medium", location: "Riverside Area", message: "Water levels rising. Monitor conditions.", time: "15 mins ago" },
    { id: 3, severity: "low", location: "North Zone", message: "Weather improving. Risk decreasing.", time: "1 hour ago" }
  ];

  const recentReports = [
    { id: 1, type: "Water Accumulation", location: "Main Street", status: "verified", time: "10 mins ago" },
    { id: 2, type: "Road Blockage", location: "5th Avenue", status: "pending", time: "30 mins ago" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Alert */}
        <Card className="mb-8 bg-gradient-accent text-accent-foreground p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-accent-foreground/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Your Area: Moderate Risk</h2>
                <p className="opacity-90 mb-3">Rainfall expected in the next 2 hours. Stay alert and prepared.</p>
                <Button variant="outline" size="sm" className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent">
                  View Safety Guidelines
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start h-auto py-4">
                  <Camera className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Report Incident</div>
                    <div className="text-xs text-muted-foreground">Upload photo & location</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-4">
                  <Navigation className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Find Safe Route</div>
                    <div className="text-xs text-muted-foreground">Navigate safely</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Interactive Map */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Live Flood Map</h3>
              <div className="bg-secondary rounded-lg h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Interactive map with real-time flood zones</p>
                  <p className="text-sm mt-1">GPS-tagged incidents and safe routes</p>
                </div>
              </div>
            </Card>

            {/* Recent Reports */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Recent Reports</h3>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <div>
                        <div className="font-medium">{report.type}</div>
                        <div className="text-sm text-muted-foreground">{report.location} • {report.time}</div>
                      </div>
                    </div>
                    <Badge variant={report.status === "verified" ? "default" : "secondary"}>
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Active Alerts
              </h3>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === "high"
                        ? "bg-destructive/10 border-destructive"
                        : alert.severity === "medium"
                        ? "bg-warning/10 border-warning"
                        : "bg-success/10 border-success"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <Badge
                        variant={alert.severity === "high" ? "destructive" : "secondary"}
                        className="uppercase text-xs"
                      >
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <div className="font-medium text-sm mb-1">{alert.location}</div>
                    <div className="text-sm text-muted-foreground">{alert.message}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Safety Tips */}
            <Card className="p-6 bg-gradient-primary text-primary-foreground">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Safety Tips
              </h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Keep emergency supplies ready</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Stay informed through official channels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Never drive through flooded areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Follow evacuation orders immediately</span>
                </li>
              </ul>
            </Card>

            {/* Emergency Contacts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Emergency Contacts</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency Services</span>
                  <span className="font-semibold">911</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flood Hotline</span>
                  <span className="font-semibold">1-800-FLOOD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Local Authority</span>
                  <span className="font-semibold">555-0123</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ChatbotButton />
    </div>
  );
};

export default Citizen;
