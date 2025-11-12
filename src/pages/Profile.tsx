import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authAPI, setStoredUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: (user as any)?.phone_number || "",
    address: (user as any)?.address || "",
  });
  const [saving, setSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      await authAPI.updateProfile(form);
      // Fetch latest user from backend to update local storage/context
      const refreshed = await authAPI.getUserInfo();
      setStoredUser(refreshed.user);
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!oldPassword || !newPassword) {
        toast({ title: "Error", description: "Enter both old and new password", variant: "destructive" });
        return;
      }
      setChanging(true);
      await authAPI.changePassword(oldPassword, newPassword);
      toast({ title: "Password changed", description: "Please log in again." });
      await logout();
      navigate("/auth");
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to change password", variant: "destructive" });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <Label>First name</Label>
                <Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              {user.user_type === "citizen" && (
                <>
                  <div>
                    <Label>Phone number</Label>
                    <Input value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                  </div>
                </>
              )}
              {user.user_type === "admin" && (
                <p className="text-sm text-muted-foreground">Admin accounts can manage tasks and alerts; contact support to change role-specific fields.</p>
              )}
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <Label>Old password</Label>
                <Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div>
              <div>
                <Label>New password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <Button variant="hero" onClick={handleChangePassword} disabled={changing}>{changing ? "Changing..." : "Change Password"}</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
