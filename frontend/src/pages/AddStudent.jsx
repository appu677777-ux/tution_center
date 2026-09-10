import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Loader2,
  UserPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function AddStudent() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    studentId: "",
    admissionNumber: "",
    name: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    parentName: "",
    parentPhone: "",
    house: "",
    place: "",
    district: "",
    academicYear: "",
    course: "",
    batch: "",
    admissionDate: "",
    totalFee: "",
    notes: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (
      !form.studentId ||
      !form.admissionNumber ||
      !form.name ||
      !form.parentName ||
      !form.parentPhone ||
      !form.academicYear ||
      !form.course ||
      !form.batch ||
      form.totalFee === ""
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    try {
      setLoading(true);

      const studentData = {
        studentId: form.studentId.trim(),
        admissionNumber: form.admissionNumber.trim(),
        name: form.name.trim(),

        dateOfBirth:
          form.dateOfBirth || undefined,

        gender:
          form.gender || undefined,

        phone:
          form.phone.trim() || undefined,

        parentName:
          form.parentName.trim(),

        parentPhone:
          form.parentPhone.trim(),

        address: {
          house: form.house.trim(),
          place: form.place.trim(),
          district: form.district.trim()
        },

        academicYear:
          form.academicYear.trim(),

        course:
          form.course.trim(),

        batch:
          form.batch.trim(),

        admissionDate:
          form.admissionDate || undefined,

        totalFee:
          Number(form.totalFee),

        notes:
          form.notes.trim() || undefined
      };

      await api("/students", {
        method: "POST",
        body: JSON.stringify(studentData)
      });

      // Return to students page after successful save
      navigate("/students");

    } catch (error) {
      setError(
        error.message ||
        "Unable to create student."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate("/students")}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <ArrowLeft size={20} />
            </button>

            <div>

              <p className="text-sm font-medium text-indigo-600">
                Students
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                Add Student
              </h1>

            </div>

          </div>

        </div>

      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* BASIC INFORMATION */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  <UserPlus size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Basic Information
                  </h2>

                  <p className="text-xs text-slate-400">
                    Enter the student's identification details.
                  </p>
                </div>

              </div>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-3">

              {/* STUDENT ID */}
              <Input
                label="Student ID"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                placeholder="STU-001"
                required
              />

              {/* ADMISSION NUMBER */}
              <Input
                label="Admission Number"
                name="admissionNumber"
                value={form.admissionNumber}
                onChange={handleChange}
                placeholder="ADM-001"
                required
              />

              {/* NAME */}
              <Input
                label="Student Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />

              {/* DOB */}
              <Input
                label="Date of Birth"
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />

              {/* GENDER */}
              <Select
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                options={[
                  "Male",
                  "Female",
                  "Other"
                ]}
              />

              {/* PHONE */}
              <Input
                label="Student Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />

            </div>

          </div>

          {/* PARENT INFORMATION */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <h2 className="font-semibold text-slate-900">
                Parent / Guardian Information
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Contact information of the student's parent or guardian.
              </p>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">

              <Input
                label="Parent Name"
                name="parentName"
                value={form.parentName}
                onChange={handleChange}
                placeholder="Enter parent name"
                required
              />

              <Input
                label="Parent Phone"
                name="parentPhone"
                value={form.parentPhone}
                onChange={handleChange}
                placeholder="9876543210"
                required
              />

            </div>

          </div>

          {/* ADDRESS */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <h2 className="font-semibold text-slate-900">
                Address
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Student residential information.
              </p>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-3">

              <Input
                label="House / Building"
                name="house"
                value={form.house}
                onChange={handleChange}
                placeholder="House name"
              />

              <Input
                label="Place"
                name="place"
                value={form.place}
                onChange={handleChange}
                placeholder="Place"
              />

              <Input
                label="District"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="District"
              />

            </div>

          </div>

          {/* ACADEMIC INFORMATION */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <h2 className="font-semibold text-slate-900">
                Academic Information
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Course and batch details.
              </p>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-3">

              <Input
                label="Academic Year"
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                placeholder="2026-2027"
                required
              />

              <Input
                label="Course"
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="BCA"
                required
              />

              <Input
                label="Batch"
                name="batch"
                value={form.batch}
                onChange={handleChange}
                placeholder="Batch A"
                required
              />

              <Input
                label="Admission Date"
                type="date"
                name="admissionDate"
                value={form.admissionDate}
                onChange={handleChange}
              />

            </div>

          </div>

          {/* FEE */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <h2 className="font-semibold text-slate-900">
                Fee Information
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Set the total course fee. Payments will be recorded separately.
              </p>

            </div>

            <div className="p-6">

              <div className="max-w-md">

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Total Fee <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="totalFee"
                    value={form.totalFee}
                    onChange={handleChange}
                    placeholder="30000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  />

                </div>

              </div>

            </div>

          </div>

          {/* NOTES */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <h2 className="font-semibold text-slate-900">
                Additional Notes
              </h2>

            </div>

            <div className="p-6">

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Any additional information about the student..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

            </div>

          </div>

          {/* BUTTONS */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => navigate("/students")}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >

              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Student
                </>
              )}

            </button>

          </div>

        </form>

      </main>

    </div>
  );
}


/* ============================= */
/* REUSABLE INPUT */
/* ============================= */

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      />

    </div>
  );
}


/* ============================= */
/* REUSABLE SELECT */
/* ============================= */

function Select({
  label,
  name,
  value,
  onChange,
  options
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      >

        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}

export default AddStudent;