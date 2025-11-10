import { Users, AlertTriangle, TrendingUp, MapPin, CheckCircle, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChatbotButton } from "@/components/ChatbotButton";

const Admin = () => {
  const tasks = [
    { id: 1, title: "Inspect drainage system - Zone A", assignee: "Team Alpha", progress: 75, status: "in-progress" },
    { id: 2, title: "Deploy sandbags - Riverside", assignee: "Team Beta", progress: 100, status: "completed" },
    { id: 3, title: "Evacuate low-lying areas", assignee: "Team Gamma", progress: 40, status: "in-progress" },
    { id: 4, title: "Set up emergency shelter", assignee: "Team Delta", progress: 0, status: "pending" }
  ];

  const incidents = [
    { id: 1, type: "Road Flooding", location: "Main St & 5th Ave", severity: "high", reports: 12, time: "5m ago" },
    { id: 2, type: "Water Accumulation", location: "Park District", severity: "medium", reports: 7, time: "15m ago" },
    { id: 3, type: "Drainage Issue", location: "Industrial Zone", severity: "low", reports: 3, time: "1h ago" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <Badge variant="destructive">+5</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">24</div>
            <div className="text-sm text-muted-foreground">Active Incidents</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <Badge className="bg-accent text-accent-foreground">Live</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">156</div>
            <div className="text-sm text-muted-foreground">Response Teams</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <Badge className="bg-success text-success-foreground">98%</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">342</div>
            <div className="text-sm text-muted-foreground">Resolved Today</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-warning" />
              </div>
              <Badge className="bg-warning text-warning-foreground">12</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">8</div>
            <div className="text-sm text-muted-foreground">High-Risk Zones</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Predictive Analytics */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Flood Risk Prediction (Next 24h)
                </h3>
                <Button variant="outline" size="sm">Export</Button>
              </div>
              <div className="bg-gradient-to-r from-success/20 via-warning/20 to-destructive/20 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Predictive analytics chart</p>
                  <p className="text-sm mt-1">AI-powered risk forecasting</p>
                </div>
              </div>
            </Card>

            {/* Incident Heatmap */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Live Incident Heatmap</h3>
              <div className="bg-secondary rounded-lg h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Geographic heatmap visualization</p>
                  <p className="text-sm mt-1">Real-time incident density mapping</p>
                </div>
              </div>
            </Card>

            {/* Active Incidents */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Priority Incidents</h3>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <div key={incident.id} className="p-4 bg-secondary rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              incident.severity === "high"
                                ? "destructive"
                                : incident.severity === "medium"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {incident.severity}
                          </Badge>
                          <span className="font-semibold">{incident.type}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {incident.location}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{incident.reports} reports</span>
                          <span>{incident.time}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Assign Team</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Management */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Active Tasks
              </h3>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{task.title}</div>
                        <div className="text-xs text-muted-foreground mb-2">{task.assignee}</div>
                      </div>
                      <Badge
                        variant={
                          task.status === "completed"
                            ? "default"
                            : task.status === "in-progress"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {task.status === "completed" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : task.status === "in-progress" ? (
                          <Clock className="h-3 w-3 mr-1" />
                        ) : null}
                        {task.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline" size="sm">
                View All Tasks
              </Button>
            </Card>

            {/* Response Teams */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Response Teams Status</h3>
              <div className="space-y-3">
                {["Alpha", "Beta", "Gamma", "Delta"].map((team, idx) => (
                  <div key={team} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          idx === 0 ? "bg-success" : idx === 3 ? "bg-warning" : "bg-accent"
                        }`}
                      />
                      <span className="font-medium">Team {team}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {idx === 0 ? "Active" : idx === 3 ? "Standby" : "Deployed"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-gradient-accent text-accent-foreground">
              <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent"
                  size="sm"
                >
                  Send Mass Alert
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent"
                  size="sm"
                >
                  Deploy Emergency Team
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent"
                  size="sm"
                >
                  Generate Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ChatbotButton />
    </div>
  );
};

export default Admin;
