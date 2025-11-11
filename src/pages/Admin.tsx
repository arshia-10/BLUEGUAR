import { Users, AlertTriangle, TrendingUp, MapPin, CheckCircle, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useEffect, useState } from "react";
import { reportsAPI, resolveMediaUrl } from "@/lib/api";

const Admin = () => {
  const tasks = [
    { id: 1, title: "Inspect drainage system - Zone A", assignee: "Team Alpha", progress: 75, status: "in-progress" },
    { id: 2, title: "Deploy sandbags - Riverside", assignee: "Team Beta", progress: 100, status: "completed" },
    { id: 3, title: "Evacuate low-lying areas", assignee: "Team Gamma", progress: 40, status: "in-progress" },
    { id: 4, title: "Set up emergency shelter", assignee: "Team Delta", progress: 0, status: "pending" }
  ];

  // Citizen reports fetched from backend
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [reportCount, setReportCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(false);
  const [countError, setCountError] = useState<string | null>(null);


  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoadingReports(true);
        setReportsError(null);
        // Use public all-reports endpoint for admin dashboard
        const res = await reportsAPI.getAllReports();
        setReports(res.reports || []);
      } catch (e: any) {
        setReportsError(e.message || "Failed to load reports");
      } finally {
        setIsLoadingReports(false);
      }
    };

    const fetchCount = async () => {
      try {
        setIsLoadingCount(true);
        setCountError(null);
        const res = await reportsAPI.getReportCount();
        setReportCount(res.count);
      } catch (e: any) {
        setCountError(e.message || "Failed to load count");
      } finally {
        setIsLoadingCount(false);
      }
    };
    fetchReports();
    fetchCount();

  }, []);

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
            <div className="text-3xl font-bold mb-1">
              {isLoadingCount ? "…" : (reportCount ?? 0)}
            </div>
            <div className="text-sm text-muted-foreground">Active Incidents</div>
            {countError && (
              <div className="text-xs text-destructive mt-2">{countError}</div>
            )}
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
              {isLoadingReports ? (
                <div className="text-sm text-muted-foreground">Loading reports…</div>
              ) : reportsError ? (
                <div className="text-sm text-destructive">{reportsError}</div>
              ) : (
                <div className="space-y-3">
                  {reports.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No incidents reported yet.</div>
                  ) : (
                    reports.map((r) => (
                      <div key={r.id} className="p-4 bg-secondary rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  r.status === "resolved"
                                    ? "default"
                                    : r.status === "reviewed"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {r.status}
                              </Badge>
                              <span className="font-semibold">{r.location}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {r.reporter_name} • {new Date(r.created_at).toLocaleString()}
                            </div>
                            <div className="text-sm">{r.description}</div>
                            {r.image && (
                              <div className="mt-3">
                                <img
                                  src={resolveMediaUrl(r.image)}
                                  alt="Incident"
                                  className="h-28 w-auto rounded-md border object-cover"
                                />
                              </div>
                            )}
                            {r.audio && (
                              <div className="mt-3">
                                <audio
                                  controls
                                  src={resolveMediaUrl(r.audio)}
                                  className="w-full"
                                >
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            )}
                          </div>
                          <Button size="sm" variant="outline">Assign Team</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
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


    </div>
  );
};

export default Admin;
