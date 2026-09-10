import { useEffect, useState } from "react";
import {
  User,
  Lock,
  Building2,
  LogOut,
  Save,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

import { api } from "../services/api";

function Settings({
  staff,
  onLogout,
  onStaffUpdate
}) {

  // ==========================================
  // PROFILE
  // ==========================================

  const [profile, setProfile] = useState({
    name: staff?.name || "",
    username: staff?.username || ""
  });

  // ==========================================
  // PASSWORD
  // ==========================================

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // ==========================================
  // CENTER
  // ==========================================

  const [center, setCenter] = useState({
    name: "Tuition Center",
    phone: "",
    email: "",
    address: ""
  });

  // ==========================================
  // UI STATES
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [savingCenter, setSavingCenter] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD SETTINGS
  // ==========================================

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api("/settings");

      const settings =
        response.settings || {};

      setCenter({
        name:
          settings.centerName ||
          "Tuition Center",

        phone:
          settings.phone || "",

        email:
          settings.email || "",

        address:
          settings.address || ""
      });

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PROFILE CHANGE
  // ==========================================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ==========================================
  // PASSWORD CHANGE
  // ==========================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswords((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ==========================================
  // CENTER CHANGE
  // ==========================================

  const handleCenterChange = (e) => {
    const { name, value } = e.target;

    setCenter((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setMessage("");
      setError("");

      const response =
        await api("/auth/profile", {
          method: "PUT",

          body: JSON.stringify({
            name: profile.name.trim(),
            username:
              profile.username.trim()
          })
        });

      // Update local storage
      if (response.staff) {
  onStaffUpdate(response.staff);
}

      setMessage(
        "Profile updated successfully."
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingPassword(true);
      setMessage("");
      setError("");

      if (
        passwords.newPassword !==
        passwords.confirmPassword
      ) {
        setError(
          "New passwords do not match."
        );

        return;
      }

      if (
        passwords.newPassword.length < 6
      ) {
        setError(
          "New password must contain at least 6 characters."
        );

        return;
      }

      await api("/auth/password", {
        method: "PUT",

        body: JSON.stringify({
          currentPassword:
            passwords.currentPassword,

          newPassword:
            passwords.newPassword
        })
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setMessage(
        "Password changed successfully."
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // ==========================================
  // UPDATE CENTER
  // ==========================================

  const handleCenterSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingCenter(true);
      setMessage("");
      setError("");

      await api("/settings", {
        method: "PUT",

        body: JSON.stringify({
          centerName:
            center.name.trim(),

          phone:
            center.phone.trim(),

          email:
            center.email.trim(),

          address:
            center.address.trim()
        })
      });

      setMessage(
        "Center information saved successfully."
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to save center information."
      );
    } finally {
      setSavingCenter(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <Loader2
            size={35}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading settings...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* ======================================
          HEADER
      ====================================== */}

      <div>

        <p className="text-sm font-medium text-indigo-600">
          Settings
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account and tuition center settings.
        </p>

      </div>

      {/* ======================================
          SUCCESS
      ====================================== */}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
          {message}
        </div>
      )}

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ======================================
          STAFF PROFILE
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <User size={21} />
          </div>

          <div>

            <h2 className="font-semibold text-slate-900">
              Staff Profile
            </h2>

            <p className="text-xs text-slate-400">
              Manage your staff account information
            </p>

          </div>

        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="grid gap-5 md:grid-cols-2"
        >

          <div>

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Staff Name
            </label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          <div>

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleProfileChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          <div className="md:col-span-2">

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >

              {savingProfile ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Profile
                </>
              )}

            </button>

          </div>

        </form>

      </div>

      {/* ======================================
          CHANGE PASSWORD
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <Lock size={21} />
          </div>

          <div>

            <h2 className="font-semibold text-slate-900">
              Change Password
            </h2>

            <p className="text-xs text-slate-400">
              Update your staff account password
            </p>

          </div>

        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-5"
        >

          {/* CURRENT PASSWORD */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Current Password
            </label>

            <div className="relative">

              <input
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                name="currentPassword"
                value={
                  passwords.currentPassword
                }
                onChange={handlePasswordChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showCurrentPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* NEW PASSWORD */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  value={
                    passwords.newPassword
                  }
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Minimum 6 characters
              </p>

            </div>

            {/* CONFIRM */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  passwords.confirmPassword
                }
                onChange={handlePasswordChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>

          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >

            {savingPassword ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Changing...
              </>
            ) : (
              <>
                <Lock size={17} />
                Change Password
              </>
            )}

          </button>

        </form>

      </div>

      

      {/* ======================================
          LOGOUT
      ====================================== */}

      <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-semibold text-slate-900">
              Logout
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Sign out from your staff account.
            </p>

          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Settings;