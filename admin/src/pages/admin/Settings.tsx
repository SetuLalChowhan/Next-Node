import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  User,
  Lock,
  Bell,
  Settings as SettingsIcon,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// --- Validation Schemas ---
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  bio: z.string().max(200, "Bio must be less than 200 characters"),
})

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    enable2FA: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })

const notificationsSchema = z.object({
  emailAlerts: z.boolean(),
  pushAlerts: z.boolean(),
  weeklyDigest: z.boolean(),
  marketingEmails: z.boolean(),
})

const preferencesSchema = z.object({
  language: z.string().min(1, "Please select a language"),
  theme: z.string().min(1, "Please select a theme"),
  timezone: z.string().min(1, "Please select a timezone"),
})

type ProfileValues = z.infer<typeof profileSchema>
type SecurityValues = z.infer<typeof securitySchema>
type NotificationValues = z.infer<typeof notificationsSchema>
type PreferenceValues = z.infer<typeof preferencesSchema>

const Settings: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = location.pathname.split("/").pop() || "profile"

  const handleTabChange = (val: string) => {
    navigate(`/dashboard/settings/${val}`)
  }

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
  )

  // --- Form Initialization ---
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "Setu Lal", email: "setu@example.com", website: "https://setu.dev", bio: "Lead Frontend Engineer based in Dhaka. building pixel-perfect applications." },
  })

  const securityForm = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "", enable2FA: true },
  })

  const notificationForm = useForm<NotificationValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: { emailAlerts: true, pushAlerts: true, weeklyDigest: false, marketingEmails: false },
  })

  const preferenceForm = useForm<PreferenceValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: { language: "en", theme: "system", timezone: "utc+6" },
  })

  const triggerToast = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // --- Submit Handlers ---
  const onSaveProfile = (data: ProfileValues) => {
    console.log("Saving profile data: ", data)
    triggerToast("Profile updated successfully!")
  }

  const onSaveSecurity = (data: SecurityValues) => {
    console.log("Saving security data: ", data)
    triggerToast("Security settings updated successfully!")
    securityForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "", enable2FA: data.enable2FA })
  }

  const onSaveNotifications = (data: NotificationValues) => {
    console.log("Saving notification data: ", data)
    triggerToast("Notification preferences updated!")
  }

  const onSavePreferences = (data: PreferenceValues) => {
    console.log("Saving preference data: ", data)
    triggerToast("System preferences saved!")
    
    // Theme toggle demonstration
    if (data.theme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (data.theme === "light") {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      triggerToast("New avatar uploaded (Preview state)!")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure security credentials, notification channels, and global user profiles.
        </p>
      </div>

      {/* Dynamic Alert Banner */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 mb-4 text-sm text-emerald-800 rounded-lg bg-emerald-50 border border-emerald-200 transition-all">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Tabs list wrapper */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col md:flex-row gap-6">
        <TabsList className="flex flex-row md:flex-col h-auto md:w-60 bg-muted/30 border border-border p-1.5 rounded-xl justify-start items-stretch gap-1 shrink-0 overflow-x-auto">
          <TabsTrigger value="profile" className="flex items-center justify-start gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-lg cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-left">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            Profile Details
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-start gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-lg cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-left">
            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
            Security & Access
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-start gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-lg cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-left">
            <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center justify-start gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-lg cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-left">
            <SettingsIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          {/* PROFILE FORM */}
          <TabsContent value="profile" className="m-0">
            <Card className="border border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Profile Details</CardTitle>
                <CardDescription className="text-xs">
                  Update public identity information visible to coworkers and visitors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar upload section */}
                <div className="flex flex-col sm:flex-row gap-5 items-center pb-4 border-b border-border/50">
                  <div className="relative h-20 w-20 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0 shadow-sm">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                    <span className="font-semibold text-sm text-foreground">Profile Picture</span>
                    <span className="text-xs text-muted-foreground mt-0.5 mb-3.5">
                      JPG or PNG, max scale of 2MB size limit.
                    </span>
                    <div className="relative">
                      <Button variant="outline" size="sm" className="relative cursor-pointer font-semibold text-xs h-8">
                        <UploadCloud className="h-3.5 w-3.5 mr-1.5 opacity-80" />
                        Choose New File
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={handleAvatarChange}
                        />
                      </Button>
                    </div>
                  </div>
                </div>

                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" placeholder="Jane Doe" {...profileForm.register("fullName")} />
                      {profileForm.formState.errors.fullName && (
                        <p className="text-xs text-destructive font-medium mt-1">
                          {profileForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="jane@example.com" {...profileForm.register("email")} />
                      {profileForm.formState.errors.email && (
                        <p className="text-xs text-destructive font-medium mt-1">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="website">Website Link</Label>
                    <Input id="website" placeholder="https://website.com" {...profileForm.register("website")} />
                    {profileForm.formState.errors.website && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        {profileForm.formState.errors.website.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea id="bio" placeholder="Write a short summary about yourself..." className="min-h-[100px]" {...profileForm.register("bio")} />
                    {profileForm.formState.errors.bio && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        {profileForm.formState.errors.bio.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" className="font-semibold text-xs h-9 cursor-pointer">
                      Save Profile Updates
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY FORM */}
          <TabsContent value="security" className="m-0">
            <Card className="border border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Security Credentials</CardTitle>
                <CardDescription className="text-xs">
                  Review authentication passwords and set up secondary security checkpoints.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={securityForm.handleSubmit(onSaveSecurity)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" placeholder="••••••••" {...securityForm.register("currentPassword")} />
                    {securityForm.formState.errors.currentPassword && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        {securityForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" placeholder="••••••••" {...securityForm.register("newPassword")} />
                      {securityForm.formState.errors.newPassword && (
                        <p className="text-xs text-destructive font-medium mt-1">
                          {securityForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="••••••••" {...securityForm.register("confirmPassword")} />
                      {securityForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive font-medium mt-1">
                          {securityForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2FA Switch */}
                  <div className="flex items-center justify-between rounded-lg border border-border p-4 mt-6">
                    <div className="space-y-0.5 pr-4">
                      <span className="text-sm font-semibold text-foreground">Two-Factor Authentication</span>
                      <p className="text-xs text-muted-foreground">
                        Require an auth security code on each login attempt.
                      </p>
                    </div>
                    <Switch
                      checked={securityForm.watch("enable2FA")}
                      onCheckedChange={(val) => securityForm.setValue("enable2FA", val)}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" className="font-semibold text-xs h-9 cursor-pointer">
                      Update Password & 2FA
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS FORM */}
          <TabsContent value="notifications" className="m-0">
            <Card className="border border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Notification Prefs</CardTitle>
                <CardDescription className="text-xs">
                  Choose which alerts you want to receive across communication channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={notificationForm.handleSubmit(onSaveNotifications)} className="space-y-4">
                  {/* Switch and checkboxes group */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-0.5 pr-4">
                        <Label className="text-sm font-semibold">Email Alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive notifications when system triggers exceptions via Email.
                        </p>
                      </div>
                      <Switch
                        checked={notificationForm.watch("emailAlerts")}
                        onCheckedChange={(val) => notificationForm.setValue("emailAlerts", val)}
                      />
                    </div>

                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-0.5 pr-4">
                        <Label className="text-sm font-semibold">Push Alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive live notifications inside browser alerts.
                        </p>
                      </div>
                      <Switch
                        checked={notificationForm.watch("pushAlerts")}
                        onCheckedChange={(val) => notificationForm.setValue("pushAlerts", val)}
                      />
                    </div>

                    <div className="flex items-start space-x-3.5 pt-2">
                      <Checkbox
                        id="weeklyDigest"
                        checked={notificationForm.watch("weeklyDigest")}
                        onCheckedChange={(val) => notificationForm.setValue("weeklyDigest", !!val)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor="weeklyDigest" className="text-sm font-semibold text-foreground cursor-pointer">
                          Weekly Analytics Digest
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Receive an aggregate performance email summary every Monday.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3.5 pt-2">
                      <Checkbox
                        id="marketingEmails"
                        checked={notificationForm.watch("marketingEmails")}
                        onCheckedChange={(val) => notificationForm.setValue("marketingEmails", !!val)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor="marketingEmails" className="text-sm font-semibold text-foreground cursor-pointer">
                          Product Releases and Tips
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Receive newsletters about updates and tutorials.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" className="font-semibold text-xs h-9 cursor-pointer">
                      Save Notification Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PREFERENCES FORM */}
          <TabsContent value="preferences" className="m-0">
            <Card className="border border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">System Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Change language formats, layout themes, and geographic timezone zones.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={preferenceForm.handleSubmit(onSavePreferences)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Language select */}
                    <div className="space-y-1.5">
                      <Label htmlFor="language">Display Language</Label>
                      <Select
                        value={preferenceForm.watch("language")}
                        onValueChange={(val) => preferenceForm.setValue("language", val)}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English (US)</SelectItem>
                          <SelectItem value="es">Español (ES)</SelectItem>
                          <SelectItem value="fr">Français (FR)</SelectItem>
                          <SelectItem value="de">Deutsch (DE)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Theme select */}
                    <div className="space-y-1.5">
                      <Label htmlFor="theme">Interface Theme</Label>
                      <Select
                        value={preferenceForm.watch("theme")}
                        onValueChange={(val) => preferenceForm.setValue("theme", val)}
                      >
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Select Theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light Mode</SelectItem>
                          <SelectItem value="dark">Dark Mode</SelectItem>
                          <SelectItem value="system">System Preference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Timezone select */}
                  <div className="space-y-1.5">
                    <Label htmlFor="timezone">Geographic Timezone</Label>
                    <Select
                      value={preferenceForm.watch("timezone")}
                      onValueChange={(val) => preferenceForm.setValue("timezone", val)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc-5">UTC-05:00 Eastern Standard Time</SelectItem>
                        <SelectItem value="utc+0">UTC+00:00 Coordinated Universal Time</SelectItem>
                        <SelectItem value="utc+1">UTC+01:00 Central European Time</SelectItem>
                        <SelectItem value="utc+6">UTC+06:00 Bangladesh Standard Time</SelectItem>
                        <SelectItem value="utc+8">UTC+08:00 Singapore Standard Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" className="font-semibold text-xs h-9 cursor-pointer">
                      Save System Preferences
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default Settings
