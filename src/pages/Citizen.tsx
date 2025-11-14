import { useState, useEffect, useRef, useMemo } from "react";
import { Bell, MapPin, AlertTriangle, CheckCircle, Camera, Navigation, Loader2, Mic, MicOff, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChatbotButton } from "@/components/ChatbotButton";
import { reportsAPI, resolveMediaUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import LocationMap, { MapMarker } from "@/components/LocationMap";

const Citizen = () => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const { toast } = useToast();

  // Flood risk state
  const [floodRisk, setFloodRisk] = useState<string | null>(null);
  const [isLoadingFloodRisk, setIsLoadingFloodRisk] = useState<boolean>(false);
  const [floodRiskError, setFloodRiskError] = useState<string | null>(null);

  // Safe route state
  const [isSafeRouteDialogOpen, setIsSafeRouteDialogOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Image state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reportForm, setReportForm] = useState({
    location: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const alerts = [
    { id: 1, severity: "high", location: "Downtown District", message: "Heavy rainfall expected. Flood risk elevated.", time: "5 mins ago" },
    { id: 2, severity: "medium", location: "Riverside Area", message: "Water levels rising. Monitor conditions.", time: "15 mins ago" },
    { id: 3, severity: "low", location: "North Zone", message: "Weather improving. Risk decreasing.", time: "1 hour ago" }
  ];

  // Fetch user's reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoadingReports(true);
        const response = await reportsAPI.getReports();
        const items = response.reports || [];
        // Arrange in increasing order by created_at (oldest first)
        items.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setReports(items);
      } catch (error: any) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load reports",
          variant: "destructive",
        });
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchReports();
  }, [toast]);

  // Fetch flood risk on mount
  useEffect(() => {
    const fetchFloodRisk = async () => {
      try {
        setIsLoadingFloodRisk(true);
        setFloodRiskError(null);
        const response = await fetch("/api/chatbot/query/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "What is the current flood risk?" }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch flood risk");
        }
        const data = await response.json();
        const answer = data.answer || "";
        // Extract risk level (HIGH, MEDIUM, LOW)
        const match = answer.match(/(HIGH|MEDIUM|LOW)/i);
        setFloodRisk(match ? match[1].toUpperCase() : null);
      } catch (e: any) {
        setFloodRiskError(e.message || "Failed to load flood risk");
      } finally {
        setIsLoadingFloodRisk(false);
      }
    };
    fetchFloodRisk();
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setReportForm({
            ...reportForm,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not get your location. You can still submit the report manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const reportMarkers = useMemo(() => {
    // Count reports by proximity to calculate complaint density
    const reportsByLocation = reports
      .filter((report) => report.latitude && report.longitude)
      .reduce((acc: any, report) => {
        const lat = typeof report.latitude === "string" ? parseFloat(report.latitude) : report.latitude;
        const lng = typeof report.longitude === "string" ? parseFloat(report.longitude) : report.longitude;
        
        // Create a grid key (rounding to 2 decimals = ~1km precision)
        const gridKey = `${Math.round(lat * 100) / 100}-${Math.round(lng * 100) / 100}`;
        acc[gridKey] = (acc[gridKey] || 0) + 1;
        return acc;
      }, {});

    // Determine complaint density thresholds
    const densityValues = Object.values(reportsByLocation) as number[];
    const maxDensity = Math.max(...densityValues, 1);

    return reports
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

        // Calculate complaint density for this location
        const gridKey = `${Math.round(lat * 100) / 100}-${Math.round(lng * 100) / 100}`;
        const density = reportsByLocation[gridKey] || 0;
        const densityRatio = density / maxDensity;

        // Color based on complaint density + flood risk
        // High density = more red, Low density = more green
        let color = "#fbbf24"; // default yellow for MEDIUM

        if (floodRisk === "HIGH") {
          // HIGH risk: darker colors based on density
          color = densityRatio > 0.7 ? "#dc2626" : densityRatio > 0.4 ? "#ef4444" : "#f87171"; // dark red to light red
        } else if (floodRisk === "MEDIUM") {
          // MEDIUM risk: yellow to orange based on density
          color = densityRatio > 0.7 ? "#d97706" : densityRatio > 0.4 ? "#fbbf24" : "#fcd34d"; // orange to light yellow
        } else if (floodRisk === "LOW") {
          // LOW risk: green shades based on density
          color = densityRatio > 0.7 ? "#047857" : densityRatio > 0.4 ? "#10b981" : "#6ee7b7"; // dark green to light green
        }

        return {
          id: report.id,
          position: [lat, lng] as [number, number],
          title: report.location,
          description: report.description,
          status: report.status,
          timestamp: timestamp ? new Date(timestamp).toLocaleString() : undefined,
          color: color, // Add color property for heatmap visualization with density
          density: density, // Include density info for tooltips
        } satisfies MapMarker & { color: string; density: number };
      })
      .filter((marker): marker is MapMarker => Boolean(marker));
  }, [reports, floodRisk]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Remove audio recording
  const removeAudio = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL(null);
  };

  // Handle report submission
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.location.trim() || !reportForm.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in location and description fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const reportData: any = {
        location: reportForm.location,
        description: reportForm.description,
      };

      if (reportForm.latitude && reportForm.longitude) {
        reportData.latitude = parseFloat(reportForm.latitude);
        reportData.longitude = parseFloat(reportForm.longitude);
      }

      // Round coordinates to 8 decimal places to match database field precision
      if (reportData.latitude) {
        reportData.latitude = Math.round(reportData.latitude * 100000000) / 100000000;
      }
      if (reportData.longitude) {
        reportData.longitude = Math.round(reportData.longitude * 100000000) / 100000000;
      }

      // Add image if selected
      if (selectedImage) {
        reportData.image = selectedImage;
      }

      // Add audio if recorded
      if (audioBlob) {
        // Convert blob to File
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        reportData.audio = audioFile;
      }

      const response = await reportsAPI.createReport(reportData);
      
      toast({
        title: "Success",
        description: response.message || "Report submitted successfully!",
      });

      // Reset form
      setReportForm({
        location: "",
        description: "",
        latitude: "",
        longitude: "",
      });
      removeImage();
      removeAudio();

      // Close dialog
      setIsReportDialogOpen(false);

      // Refresh reports list
      const reportsResponse = await reportsAPI.getReports();
      const items = reportsResponse.reports || [];
      items.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setReports(items);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Handle safe route calculation
  const handleCalculateSafeRoute = async () => {
    if (!destination.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a destination",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCalculatingRoute(true);
      
      // Get current location
      const currentLoc = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              reject(error);
            }
          );
        } else {
          reject(new Error("Geolocation not supported"));
        }
      });

      // Build routing URL (using OpenStreetMap/Nominatim + routing)
      const routeInfo = {
        from: `${currentLoc.lat},${currentLoc.lng}`,
        to: destination,
        riskLevel: floodRisk,
        recommendations: getRiskBasedRecommendations(),
      };

      // Show toast with recommendations
      toast({
        title: "Safe Route Calculated",
        description: routeInfo.recommendations,
      });

      // Open Google Maps or another routing service
      const encodedDest = encodeURIComponent(destination);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLoc.lat},${currentLoc.lng}&destination=${encodedDest}&travelmode=driving`;
      window.open(mapsUrl, "_blank");

      setIsSafeRouteDialogOpen(false);
      setDestination("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Get risk-based route recommendations
  const getRiskBasedRecommendations = (): string => {
    if (floodRisk === "HIGH") {
      return "🔴 HIGH RISK: Avoid low-lying areas, underpasses, and riverside routes. Take elevated paths when possible. Stay on main roads.";
    } else if (floodRisk === "MEDIUM") {
      return "🟡 MEDIUM RISK: Avoid flood-prone areas. Check weather updates frequently. Have an alternate route ready.";
    } else if (floodRisk === "LOW") {
      return "🟢 LOW RISK: Conditions are stable. Standard routes are safe, but stay vigilant and monitor weather.";
    }
    return "Route calculated. Stay alert and avoid flooded areas.";
  };

  // Get safe areas to navigate to
  const getSafeAreas = (): { name: string; reason: string; emoji: string }[] => {
    // Common safe areas in Delhi/flood-prone regions
    const safeAreasDatabase: { [key: string]: { name: string; reason: string; emoji: string }[] } = {
      HIGH: [
        { name: "Higher Ground Areas", emoji: "⛰️", reason: "Elevated locations away from waterlogging" },
        { name: "Government Buildings", emoji: "🏛️", reason: "Typically on elevated ground with emergency support" },
        { name: "Hospitals/Medical Centers", emoji: "🏥", reason: "Located on high ground with flood protection" },
        { name: "Community Centers", emoji: "🏢", reason: "Relief shelters with emergency provisions" },
        { name: "Parking Structures", emoji: "🅿️", reason: "Multi-level facilities on elevated areas" },
      ],
      MEDIUM: [
        { name: "Main Roads/Highways", emoji: "🛣️", reason: "Better drainage and quick escape routes" },
        { name: "Shopping Malls", emoji: "🛍️", reason: "Multi-story buildings with emergency procedures" },
        { name: "Educational Institutions", emoji: "🏫", reason: "Well-maintained infrastructure and elevated areas" },
        { name: "Hotels/Lodges", emoji: "🏨", reason: "Equipped with flood preparedness" },
        { name: "Parks on High Ground", emoji: "🌳", reason: "Open areas with natural elevation" },
      ],
      LOW: [
        { name: "Any Local Area", emoji: "✓", reason: "Overall safe conditions - all areas accessible" },
        { name: "Market Areas", emoji: "🏪", reason: "Normal commercial zones are safe" },
        { name: "Residential Neighborhoods", emoji: "🏘️", reason: "Standard navigation routes available" },
        { name: "Public Transportation Hubs", emoji: "🚌", reason: "Good connectivity and infrastructure" },
        { name: "Tourist Attractions", emoji: "🎭", reason: "Popular areas with proper infrastructure" },
      ],
    };

    return safeAreasDatabase[floodRisk || "LOW"] || safeAreasDatabase["LOW"];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Dynamic Flood Risk Alert */}
        <Card className={`mb-8 p-6 shadow-lg ${
          floodRisk === "HIGH" ? "bg-red-50 border-red-200" :
          floodRisk === "MEDIUM" ? "bg-yellow-50 border-yellow-200" :
          floodRisk === "LOW" ? "bg-green-50 border-green-200" :
          "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                floodRisk === "HIGH" ? "bg-red-200" :
                floodRisk === "MEDIUM" ? "bg-yellow-200" :
                floodRisk === "LOW" ? "bg-green-200" :
                "bg-gray-200"
              }`}>
                <AlertTriangle className={`h-6 w-6 ${
                  floodRisk === "HIGH" ? "text-red-600" :
                  floodRisk === "MEDIUM" ? "text-yellow-600" :
                  floodRisk === "LOW" ? "text-green-600" :
                  "text-gray-600"
                }`} />
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold mb-1 ${
                  floodRisk === "HIGH" ? "text-red-900" :
                  floodRisk === "MEDIUM" ? "text-yellow-900" :
                  floodRisk === "LOW" ? "text-green-900" :
                  "text-gray-900"
                }`}>
                  {isLoadingFloodRisk ? "Fetching flood risk..." : `Current Flood Risk: ${floodRisk || "Unknown"}`}
                </h2>
                <p className={`mb-3 ${
                  floodRisk === "HIGH" ? "text-red-700" :
                  floodRisk === "MEDIUM" ? "text-yellow-700" :
                  floodRisk === "LOW" ? "text-green-700" :
                  "text-gray-700"
                }`}>
                  {floodRisk === "HIGH" && "⚠️ High flood risk detected. Avoid flood-prone areas and stay alert."}
                  {floodRisk === "MEDIUM" && "⚡ Moderate flood risk. Monitor weather conditions and be prepared."}
                  {floodRisk === "LOW" && "✓ Low flood risk. Conditions are stable, but stay vigilant."}
                  {!floodRisk && "Loading real-time flood risk data..."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${
                    floodRisk === "HIGH" ? "border-red-300 bg-red-100 hover:bg-red-200 text-red-900" :
                    floodRisk === "MEDIUM" ? "border-yellow-300 bg-yellow-100 hover:bg-yellow-200 text-yellow-900" :
                    floodRisk === "LOW" ? "border-green-300 bg-green-100 hover:bg-green-200 text-green-900" :
                    "border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  View Safety Guidelines
                </Button>
              </div>
            </div>
            {isLoadingFloodRisk && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                  <DialogTrigger asChild>
                <Button variant="outline" className="justify-start h-auto py-4">
                  <Camera className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Report Incident</div>
                    <div className="text-xs text-muted-foreground">Upload photo & location</div>
                  </div>
                </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] z-[2000]">
                    <DialogHeader>
                      <DialogTitle>Report Flood Incident</DialogTitle>
                      <DialogDescription>
                        Report a flood incident in your area. Your location will help authorities respond quickly.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitReport} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          placeholder="e.g., Main Street, Downtown"
                          value={reportForm.location}
                          onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the flood incident, water level, affected areas, etc."
                          value={reportForm.description}
                          onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getCurrentLocation}
                          className="flex-1"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Get My Location
                        </Button>
                      </div>
                      {(reportForm.latitude || reportForm.longitude) && (
                        <div className="text-xs text-muted-foreground">
                          Coordinates: {reportForm.latitude}, {reportForm.longitude}
                        </div>
                      )}
                      
                      {/* Image Upload */}
                      <div className="space-y-2">
                        <Label>Image (Optional)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="image-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1"
                          >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            {selectedImage ? "Change Image" : "Select Image"}
                          </Button>
                          {selectedImage && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={removeImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {imagePreview && (
                          <div className="relative mt-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-md border"
                            />
                          </div>
                        )}
                      </div>

                      {/* Voice Recording */}
                      <div className="space-y-2">
                        <Label>Voice Note (Optional)</Label>
                        <div className="flex items-center gap-2">
                          {!isRecording && !audioURL && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={startRecording}
                              className="flex-1"
                            >
                              <Mic className="mr-2 h-4 w-4" />
                              Start Recording
                            </Button>
                          )}
                          {isRecording && (
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={stopRecording}
                              className="flex-1"
                            >
                              <MicOff className="mr-2 h-4 w-4" />
                              Stop Recording
                            </Button>
                          )}
                          {audioURL && !isRecording && (
                            <>
                              <audio src={audioURL} controls className="flex-1" />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={removeAudio}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        {isRecording && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            Recording...
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsReportDialogOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Report"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="justify-start h-auto py-4" onClick={() => setIsSafeRouteDialogOpen(true)}>
                  <Navigation className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Find Safe Route</div>
                    <div className="text-xs text-muted-foreground">Navigate safely</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Safe Route Dialog */}
            <Dialog open={isSafeRouteDialogOpen} onOpenChange={setIsSafeRouteDialogOpen}>
              <DialogContent className="sm:max-w-[425px]" style={{ zIndex: 9999 }}>
                <DialogHeader>
                  <DialogTitle>Find Safe Route</DialogTitle>
                  <DialogDescription>
                    Enter your destination and we'll guide you through safer areas based on current flood conditions.
                  </DialogDescription>
                </DialogHeader>

                {/* Risk Level Display */}
                <div className="py-2">
                  <div className="text-sm font-semibold mb-2">Current Flood Risk</div>
                  <div
                    className={`p-3 rounded-lg text-white text-sm font-medium ${
                      floodRisk === "HIGH"
                        ? "bg-red-500"
                        : floodRisk === "MEDIUM"
                        ? "bg-yellow-500"
                        : floodRisk === "LOW"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {floodRisk === "HIGH"
                      ? "🔴 HIGH - Avoid flood-prone areas"
                      : floodRisk === "MEDIUM"
                      ? "🟡 MEDIUM - Stay cautious"
                      : floodRisk === "LOW"
                      ? "🟢 LOW - Safe conditions"
                      : "⚪ Loading..."}
                  </div>
                </div>

                {/* Destination Input */}
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="Enter destination address or landmark"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    disabled={isCalculatingRoute}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isCalculatingRoute) {
                        handleCalculateSafeRoute();
                      }
                    }}
                  />
                </div>

                {/* Route Recommendations */}
                <div className="py-2 space-y-2">
                  <div className="text-sm font-semibold">Recommendations</div>
                  <div className="text-xs text-muted-foreground bg-slate-100 p-3 rounded-lg whitespace-pre-wrap">
                    {getRiskBasedRecommendations()}
                  </div>
                </div>

                {/* Safe Areas to Navigate To */}
                <div className="py-2 space-y-2">
                  <div className="text-sm font-semibold">Safe Areas to Navigate To</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {getSafeAreas().map((area, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition"
                        onClick={() => setDestination(area.name)}
                      >
                        <span className="text-lg min-w-fit">{area.emoji}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-slate-900">{area.name}</div>
                          <div className="text-xs text-slate-600">{area.reason}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsSafeRouteDialogOpen(false)}
                    disabled={isCalculatingRoute}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCalculateSafeRoute}
                    disabled={isCalculatingRoute || !destination.trim()}
                    className="gap-2"
                  >
                    {isCalculatingRoute ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4" />
                        Navigate
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Interactive Map */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Live Flood Map</h3>
              <LocationMap
                markers={reportMarkers}
                height="24rem"
                emptyMessage="Reports with GPS data will appear on the map once submitted."
              />
            </Card>

            {/* Recent Reports */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Recent Reports</h3>
              {isLoadingReports ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No reports yet.</p>
                  <p className="text-sm mt-1">Click "Report Incident" to submit your first report.</p>
                </div>
              ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{report.location}</div>
                          <div className="text-sm text-muted-foreground">{report.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(report.created_at)}
                          </div>
                          {report.assigned_team && (
                            <div className="mt-2">
                              <Badge variant="default" className="text-xs">
                                Team Assigned: {report.assigned_team.name}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          report.status === "resolved" 
                            ? "default" 
                            : report.status === "reviewed"
                            ? "secondary"
                            : "outline"
                        }
                        className="flex-shrink-0"
                      >
                        {report.status === "reviewed" ? "in-progress" : report.status}
                      </Badge>
                    </div>
                    {report.image && (
                      <div className="mt-3">
                        <img
                          src={resolveMediaUrl(report.image)}
                          alt="Report"
                          className="h-28 w-auto rounded-md border object-cover"
                        />
                      </div>
                    )}
                    {report.audio && (
                      <div className="mt-3">
                        <audio
                          controls
                          src={resolveMediaUrl(report.audio)}
                          className="w-full"
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
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
