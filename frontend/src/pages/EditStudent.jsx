import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2
} from "lucide-react";

import { api } from "../services/api";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Amount already paid by the student
  const [paidAmount, setPaidAmount] = useState(0);

  // Original total fee
  const [oldTotalFee, setOldTotalFee] = useState(0);

  const [formData, setFormData] = useState({
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
    status: "Active",
    notes: ""
  });

  // ==========================================
  // LOAD STUDENT
  // ==========================================

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      setError("");

      // Get student
      const studentResponse = await api(
        `/students/${id}`
      );

      // Supports:
      // { student: {...} }
      // or direct student object
      const student =
        studentResponse.student ||
        studentResponse;

      // Get payment information
      const paymentResponse = await api(
        `/payments/student/${id}`
      );

      const feeSummary =
        paymentResponse.feeSummary || {};

      const alreadyPaid =
        Number(feeSummary.totalPaid || 0);

      const currentTotalFee =
        Number(student.totalFee || 0);

      // Store payment information
      setPaidAmount(alreadyPaid);
      setOldTotalFee(currentTotalFee);

      // Fill form
      setFormData({
        studentId:
          student.studentId || "",

        admissionNumber:
          student.admissionNumber || "",

        name:
          student.name || "",

        dateOfBirth:
          student.dateOfBirth
            ? new Date(student.dateOfBirth)
                .toISOString()
                .split("T")[0]
            : "",

        gender:
          student.gender || "",

        phone:
          student.phone || "",

        parentName:
          student.parentName || "",

        parentPhone:
          student.parentPhone || "",

        house:
          student.address?.house || "",

        place:
          student.address?.place || "",

        district:
          student.address?.district || "",

        academicYear:
          student.academicYear || "",

        course:
          student.course || "",

        batch:
          student.batch || "",

        admissionDate:
          student.admissionDate
            ? new Date(student.admissionDate)
                .toISOString()
                .split("T")[0]
            : "",

        totalFee:
          student.totalFee ?? "",

        status:
          student.status || "Active",

        notes:
          student.notes || ""
      });

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load student."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts correcting
    if (error) {
      setError("");
    }
  };

  // ==========================================
  // LIVE BALANCE
  // ==========================================

  const newTotalFee =
    Number(formData.totalFee || 0);

  const newBalance = Math.max(
    newTotalFee - paidAmount,
    0
  );

  // ==========================================
  // SAVE STUDENT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const totalFee =
        Number(formData.totalFee);

      // ----------------------------------------
      // VALIDATE TOTAL FEE
      // ----------------------------------------

      if (totalFee < 0) {
        setError(
          "Total fee cannot be negative."
        );

        setSaving(false);
        return;
      }

      // ----------------------------------------
      // IMPORTANT:
      // NEW TOTAL FEE CANNOT BE LESS THAN
      // AMOUNT ALREADY PAID
      // ----------------------------------------

      if (totalFee < paidAmount) {
        setError(
          `Total fee cannot be less than the amount already paid (₹${paidAmount.toLocaleString(
            "en-IN"
          )}).`
        );

        setSaving(false);
        return;
      }

      // ----------------------------------------
      // UPDATE PAYLOAD
      // ----------------------------------------

      const payload = {
        studentId:
          formData.studentId.trim(),

        admissionNumber:
          formData.admissionNumber.trim(),

        name:
          formData.name.trim(),

        dateOfBirth:
          formData.dateOfBirth || undefined,

        gender:
          formData.gender || undefined,

        phone:
          formData.phone.trim(),

        parentName:
          formData.parentName.trim(),

        parentPhone:
          formData.parentPhone.trim(),

        address: {
          house:
            formData.house.trim(),

          place:
            formData.place.trim(),

          district:
            formData.district.trim()
        },

        academicYear:
          formData.academicYear.trim(),

        course:
          formData.course.trim(),

        batch:
          formData.batch.trim(),

        admissionDate:
          formData.admissionDate ||
          undefined,

        totalFee: totalFee,

        status:
          formData.status,

        notes:
          formData.notes.trim()
      };

      // ----------------------------------------
      // UPDATE STUDENT
      // ----------------------------------------

      await api(`/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      // Go back to student details
      navigate(`/students/${id}`);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update student."
      );
    } finally {
      setSaving(false);
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
            Loading student...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex items-center gap-4">

        <button
          type="button"
          onClick={() =>
            navigate(`/students/${id}`)
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </button>

        <div>

          <p className="text-sm font-medium text-indigo-600">
            Students
          </p>

          <h1 className="text-2xl font-bold text-slate-900">
            Edit Student
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update student information
          </p>

        </div>

      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ======================================
          FORM
      ====================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* ====================================
            PERSONAL INFORMATION
        ==================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Personal Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              label="Student ID"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
            />

            <Input
              label="Admission Number"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={handleChange}
              required
            />

            <Input
              label="Student Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                "",
                "Male",
                "Female",
                "Other"
              ]}
              labels={[
                "Select Gender",
                "Male",
                "Female",
                "Other"
              ]}
            />

            <Input
              label="Student Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

          </div>

        </div>

        {/* ====================================
            PARENT INFORMATION
        ==================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Parent / Guardian Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              label="Parent / Guardian Name"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              required
            />

            <Input
              label="Parent Phone"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              required
            />

          </div>

        </div>

        {/* ====================================
            ADDRESS
        ==================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Address
          </h2>

          <div className="grid gap-5 md:grid-cols-3">

            <Input
              label="House"
              name="house"
              value={formData.house}
              onChange={handleChange}
            />

            <Input
              label="Place"
              name="place"
              value={formData.place}
              onChange={handleChange}
            />

            <Input
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
            />

          </div>

        </div>

        {/* ====================================
            ACADEMIC INFORMATION
        ==================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Academic Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              label="Academic Year"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              required
            />

            <Input
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
            />

            <Input
              label="Batch"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              required
            />

            <Input
              label="Admission Date"
              name="admissionDate"
              type="date"
              value={formData.admissionDate}
              onChange={handleChange}
            />

          </div>

        </div>

        {/* ====================================
            FEE & STATUS
        ==================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Fee & Status
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* TOTAL FEE */}

            <Input
              label="Total Fee"
              name="totalFee"
              type="number"
              min="0"
              value={formData.totalFee}
              onChange={handleChange}
              required
            />

            {/* STATUS */}

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                "Active",
                "Inactive",
                "Completed",
                "Transferred"
              ]}
              labels={[
                "Active",
                "Inactive",
                "Completed",
                "Transferred"
              ]}
            />

          </div>

          {/* ==================================
              FEE CALCULATION
          ================================== */}

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="grid gap-4 sm:grid-cols-3">

              {/* OLD TOTAL */}

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Previous Total Fee
                </p>

                <p className="mt-1 text-lg font-bold text-slate-700">
                  ₹
                  {oldTotalFee.toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

              {/* PAID */}

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Amount Already Paid
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-600">
                  ₹
                  {paidAmount.toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

              {/* NEW BALANCE */}

              <div>

                <p className="text-xs font-medium text-slate-400">
                  New Balance
                </p>

                <p
                  className={`mt-1 text-lg font-bold ${
                    newTotalFee < paidAmount
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
                >
                  ₹
                  {newBalance.toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

            </div>

            {/* WARNING */}

            {newTotalFee < paidAmount && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                Total fee cannot be less than the
                amount already paid.
              </div>
            )}

            <p className="mt-4 text-xs text-slate-400">
              Balance is automatically calculated
              from the new total fee and existing
              payments.
            </p>

          </div>

        </div>

        {/* ====================================
            NOTES
        ==================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Notes
          </h2>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Add any additional notes..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

        </div>

        {/* ====================================
            ACTIONS
        ==================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              navigate(`/students/${id}`)
            }
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              newTotalFee < paidAmount
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {saving ? (
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
                Save Changes
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
}

// ==========================================
// INPUT COMPONENT
// ==========================================

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium text-slate-700">

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
        required={required}
        min={min}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

    </div>
  );
}

// ==========================================
// SELECT COMPONENT
// ==========================================

function Select({
  label,
  name,
  value,
  onChange,
  options,
  labels
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >

        {options.map((option, index) => (
          <option
            key={option}
            value={option}
          >
            {labels[index]}
          </option>
        ))}

      </select>

    </div>
  );
}

export default EditStudent;