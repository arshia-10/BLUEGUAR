import { Users, AlertTriangle, TrendingUp, MapPin, CheckCircle, Clock, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useEffect, useMemo, useRef, useState } from "react";
import { reportsAPI, resolveMediaUrl, teamsAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import LocationMap, { MapMarker } from "@/components/LocationMap";
import type { LatLngExpression } from "leaflet";

const Admin = () => {

  // Citizen reports fetched from backend
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  
  // Teams state
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [isAddingTeam, setIsAddingTeam] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Assign team dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [completingReportId, setCompletingReportId] = useState<number | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<number | null>(null);

  const [reportCount, setReportCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(false);
  const [countError, setCountError] = useState<string | null>(null);

  // Map focus and section reference
  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const [focusPosition, setFocusPosition] = useState<LatLngExpression | null>(null);


  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoadingReports(true);
        setReportsError(null);
        // Use public all-reports endpoint for admin dashboard
        const res = await reportsAPI.getAllReports();
        const fetchedReports = res.reports || [];
        setReports(fetchedReports);
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

  // Fetch teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoadingTeams(true);
      try {
        const response = await teamsAPI.list();
        setTeams(response.teams || []);
      } catch (error: any) {
        console.error("Error fetching teams:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load teams",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTeams(false);
      }
    };
    fetchTeams();
  }, [toast]);

  // Handle adding a new team
  const handleAddTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingTeam(true);
      const response = await teamsAPI.create(newTeamName.trim());
      setTeams([response.team, ...teams]);
      setNewTeamName("");
      toast({
        title: "Success",
        description: response.message || "Team added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add team",
        variant: "destructive",
      });
    } finally {
      setIsAddingTeam(false);
    }
  };

  // Handle assigning team to report
  const handleAssignTeam = async (reportId: number, teamId: number) => {
    try {
      setIsAssigning(true);
      const response = await reportsAPI.assignTeam(reportId, teamId);
      
      // Update the report in the list
      setReports((prevReports) =>
        prevReports.map((r) => (r.id === reportId ? response.report : r))
      );
      
      toast({
        title: "Success",
        description: response.message || "Team assigned successfully",
      });
      
      setAssignDialogOpen(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign team",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCompleteReport = async (reportId: number) => {
    try {
      setCompletingReportId(reportId);
      const response = await reportsAPI.completeReport(reportId);

      setReports((prevReports) =>
        prevReports.map((r) => (r.id === reportId ? response.report : r))
      );

      toast({
        title: "Task Completed",
        description: response.message || "Report marked as resolved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark report as completed",
        variant: "destructive",
      });
    } finally {
      setCompletingReportId(null);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this report?");
    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingReportId(reportId);
      await reportsAPI.deleteReport(reportId);

      setReports((prevReports) => prevReports.filter((r) => r.id !== reportId));
      setReportCount((prevCount) => (typeof prevCount === "number" ? Math.max(prevCount - 1, 0) : prevCount));

      toast({
        title: "Report Deleted",
        description: "The report has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the report",
        variant: "destructive",
      });
    } finally {
      setDeletingReportId(null);
    }
  };

  const incidentMarkers = useMemo(() => {
    const markers: (MapMarker | null)[] = reports
      .filter((report) => report.latitude && report.longitude)
      .map((report) => {
        const lat = typeof report.latitude === "string" ? parseFloat(report.latitude) : report.latitude;
        const lng = typeof report.longitude === "string" ? parseFloat(report.longitude) : report.longitude;

        if (
          typeof lat !== "number" ||
          typeof lng !== "number" ||
          Number.isNaN(lat) ||
          Number.isNaN(lng)
        ) {
          return null;
        }

        const timestamp = report.updated_at || report.created_at;

        return {
          id: report.id,
          position: [lat, lng] as [number, number],
          title: report.location,
          description: report.description,
          status: report.status,
          timestamp: timestamp ? new Date(timestamp).toLocaleString() : undefined,
        } as MapMarker;
      });
    return markers.filter((m): m is MapMarker => m !== null);
  }, [reports]);

  const assignedReports = useMemo(() => {
    return reports.filter((report) => report.assigned_team);
  }, [reports]);

  const activeAssignedReports = useMemo(() => {
    return assignedReports.filter((report) => report.status !== "resolved");
  }, [assignedReports]);

  const completedReports = useMemo(() => {
    return reports.filter((report) => report.status === "resolved");
  }, [reports]);

  const resolvedTodayCount = useMemo(() => {
    const today = new Date();
    return completedReports.filter((report) => {
      const completedAt =
        report.completed_task?.completed_at || report.updated_at || report.created_at;
      if (!completedAt) return false;
      const completedDate = new Date(completedAt);
      return (
        completedDate.getFullYear() === today.getFullYear() &&
        completedDate.getMonth() === today.getMonth() &&
        completedDate.getDate() === today.getDate()
      );
    }).length;
  }, [completedReports]);

  const getProgressForStatus = (status: string) => {
    if (status === "resolved") return 100;
    if (status === "reviewed") return 60;
    return 20;
  };

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
              <Badge className="bg-accent text-accent-foreground">
                {assignedReports.length > 0 ? "Live" : "Idle"}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingReports ? "…" : assignedReports.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Active Response Assignments
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <Badge className="bg-success text-success-foreground">
                {resolvedTodayCount > 0 ? "Updated" : "Waiting"}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingReports ? "…" : resolvedTodayCount}
            </div>
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
            {/* Incident Heatmap */}
            <div ref={mapSectionRef}>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Live Incident Heatmap</h3>
                <LocationMap
                  markers={incidentMarkers}
                  height="24rem"
                  emptyMessage="Incident coordinates will appear here once reports include GPS data."
                  focusPosition={focusPosition || undefined}
                />
              </Card>
            </div>

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
                        <div className="flex items-start justify-between gap-3 mb-2">
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
                            {r.assigned_team && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Assigned: Team {r.assigned_team.name}
                                </Badge>
                              </div>
                            )}
                          </div>
                            <div className="flex flex-col gap-2 items-stretch sm:items-end sm:justify-end mt-2 sm:mt-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  // Close any open Assign/Change Team dialog first
                                  if (assignDialogOpen !== null) {
                                    setAssignDialogOpen(null);
                                  }
                                  const lat = typeof r.latitude === "string" ? parseFloat(r.latitude) : r.latitude;
                                  const lng = typeof r.longitude === "string" ? parseFloat(r.longitude) : r.longitude;
                                  if (
                                    typeof lat === "number" &&
                                    typeof lng === "number" &&
                                    !Number.isNaN(lat) &&
                                    !Number.isNaN(lng)
                                  ) {
                                    setFocusPosition([lat, lng]);
                                    setTimeout(() => {
                                      mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                      // Optional: small offset for fixed headers
                                      window.scrollBy({ top: -12, left: 0, behavior: "instant" as ScrollBehavior });
                                    }, 50);
                                  }
                                }}
                              >
                                <MapPin className="h-4 w-4 mr-1" /> View on Map
                              </Button>
                              <Dialog open={assignDialogOpen === r.id} onOpenChange={(open) => setAssignDialogOpen(open ? r.id : null)}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    {r.assigned_team ? "Change Team" : "Assign Team"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Assign Team to Report</DialogTitle>
                                    <DialogDescription>
                                      Select a team to assign to this incident report.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-3 mt-4">
                                    {teams.length === 0 ? (
                                      <p className="text-sm text-muted-foreground">No teams available. Please add a team first.</p>
                                    ) : (
                                      teams.map((team) => (
                                        <Button
                                          key={team.id}
                                          variant={r.assigned_team?.id === team.id ? "default" : "outline"}
                                          className="w-full justify-start"
                                          onClick={() => handleAssignTeam(r.id, team.id)}
                                          disabled={isAssigning}
                                        >
                                          {r.assigned_team?.id === team.id && <CheckCircle className="mr-2 h-4 w-4" />}
                                          Team {team.name} ({team.status})
                                        </Button>
                                      ))
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              {r.status === "resolved" ? (
                                <Badge variant="default" className="text-xs flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Completed
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleCompleteReport(r.id)}
                                  disabled={completingReportId === r.id}
                                >
                                  {completingReportId === r.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Mark Completed"
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive focus-visible:ring-destructive"
                                onClick={() => handleDeleteReport(r.id)}
                                disabled={deletingReportId === r.id}
                                aria-label="Delete report"
                                title="Delete report"
                              >
                                {deletingReportId === r.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
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
              {activeAssignedReports.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No active tasks right now. Assign a team or complete existing tasks to update this area.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAssignedReports.map((report) => {
                    const status = report.status;
                    const progress = getProgressForStatus(status);

                    return (
                      <div key={report.id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm mb-1">
                              {report.description || "Citizen report"}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              Team {report.assigned_team?.name || "Unassigned"} • {report.location}
                            </div>
                          </div>
                          <Badge
                            variant={
                              status === "reviewed"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {status === "reviewed" ? "in-progress" : status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button className="w-full mt-4" variant="outline" size="sm">
                View All Tasks
              </Button>
            </Card>

            {/* Response Teams */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Response Teams Status</h3>
              
              {/* Add Team Input */}
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder="Enter team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTeam();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddTeam}
                  disabled={isAddingTeam || !newTeamName.trim()}
                  size="sm"
                >
                  {isAddingTeam ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add Team"
                  )}
                </Button>
              </div>

              {/* Teams List */}
              {isLoadingTeams ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : teams.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No teams yet. Add a team above.
                </div>
              ) : (
                <div className="space-y-3">
                  {teams.map((team) => {
                    const statusColors: Record<string, string> = {
                      'Active': 'bg-success',
                      'Deployed': 'bg-accent',
                      'Standby': 'bg-warning',
                    };
                    return (
                      <div key={team.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${statusColors[team.status] || 'bg-accent'}`}
                          />
                          <span className="font-medium">Team {team.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {team.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Completed Tasks */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Completed Tasks
              </h3>
              {completedReports.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No tasks completed yet. When a report is marked completed, it will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {completedReports.map((report) => {
                    const completedAt =
                      report.completed_task?.completed_at || report.updated_at || report.created_at;
                    return (
                      <div key={report.id} className="p-3 bg-secondary rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm mb-1">
                              {report.description || "Citizen report"}
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {report.assigned_team
                                ? `Team ${report.assigned_team.name}`
                                : "Team unassigned"}{" "}
                              • {report.location}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Completed on {new Date(completedAt).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant="default" className="text-xs flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Done
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
