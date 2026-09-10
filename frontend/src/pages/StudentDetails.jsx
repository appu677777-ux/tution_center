import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  GraduationCap,
  IndianRupee,
  Loader2,
  Edit,
  UserX
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [feeSummary, setFeeSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      setError("");

      // Get student details
      const studentResponse = await api(`/students/${id}`);

      // IMPORTANT:
      // Supports both:
      // { student: {...} }
      // and
      // {...}
      const studentData =
        studentResponse.student || studentResponse;

      setStudent(studentData);

      // Get fee details
      const paymentResponse = await api(
        `/payments/student/${id}`
      );

      setFeeSummary(
        paymentResponse.feeSummary || {
          totalFee: studentData.totalFee || 0,
          totalPaid: 0,
          balance: studentData.totalFee || 0
        }
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to load student details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this student?"
    );

    if (!confirmed) return;

    try {
      await api(`/students/${id}`, {
        method: "DELETE"
      });

      navigate("/students");
    } catch (err) {
      setError(
        err.message || "Unable to deactivate student"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading student details...
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Student not found
          </h2>

          <button
            onClick={() => navigate("/students")}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  const totalFee = Number(
    feeSummary?.totalFee ?? student.totalFee ?? 0
  );

  const totalPaid = Number(
    feeSummary?.totalPaid ?? 0
  );

  const balance = Number(
    feeSummary?.balance ??
      Math.max(totalFee - totalPaid, 0)
  );

  const progress =
    totalFee > 0
      ? Math.min(
          Math.round((totalPaid / totalFee) * 100),
          100
        )
      : 0;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/students")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <p className="text-sm font-medium text-indigo-600">
              Students
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Student Details
            </h1>
          </div>

        </div>

        <div className="flex flex-wrap gap-2">

          <button
            onClick={() =>
              navigate(`/students/${id}/payments`)
            }
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <IndianRupee size={17} />
            Payment History
          </button>

          <button
            onClick={() =>
              navigate(`/students/${id}/edit`)
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Edit size={17} />
            Edit
          </button>

          {student.status === "Active" && (
            <button
              onClick={handleDeactivate}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              <UserX size={17} />
              Deactivate
            </button>
          )}

        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* STUDENT PROFILE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-5">

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-3xl font-bold text-indigo-600">
            {student.name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-2xl font-bold text-slate-900">
                {student.name || "-"}
              </h2>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                {student.status || "Active"}
              </span>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Student ID:
              <span className="ml-2 font-semibold text-slate-700">
                {student.studentId || "-"}
              </span>
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Admission Number:
              <span className="ml-2 font-semibold text-slate-700">
                {student.admissionNumber || "-"}
              </span>
            </p>

          </div>

        </div>

      </div>

      {/* PERSONAL + PARENT */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* PERSONAL INFORMATION */}
        <InfoCard
          title="Personal Information"
          icon={User}
        >

          <InfoRow
            label="Full Name"
            value={student.name}
          />

          <InfoRow
            label="Date of Birth"
            value={
              student.dateOfBirth
                ? new Date(
                    student.dateOfBirth
                  ).toLocaleDateString("en-IN")
                : "-"
            }
          />

          <InfoRow
            label="Gender"
            value={student.gender || "-"}
          />

          <InfoRow
            label="Student Phone"
            value={student.phone || "-"}
          />

        </InfoCard>

        {/* PARENT INFORMATION */}
        <InfoCard
          title="Parent / Guardian"
          icon={User}
        >

          <InfoRow
            label="Parent Name"
            value={student.parentName}
          />

          <InfoRow
            label="Parent Phone"
            value={student.parentPhone}
          />

        </InfoCard>

      </div>

      {/* ACADEMIC + ADDRESS */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* ACADEMIC */}
        <InfoCard
          title="Academic Information"
          icon={GraduationCap}
        >

          <InfoRow
            label="Academic Year"
            value={student.academicYear}
          />

          <InfoRow
            label="Course"
            value={student.course}
          />

          <InfoRow
            label="Batch"
            value={student.batch}
          />

          <InfoRow
            label="Admission Date"
            value={
              student.admissionDate
                ? new Date(
                    student.admissionDate
                  ).toLocaleDateString("en-IN")
                : "-"
            }
          />

        </InfoCard>

        {/* ADDRESS */}
        <InfoCard
          title="Address"
          icon={MapPin}
        >

          <InfoRow
            label="House / Building"
            value={
              student.address?.house || "-"
            }
          />

          <InfoRow
            label="Place"
            value={
              student.address?.place || "-"
            }
          />

          <InfoRow
            label="District"
            value={
              student.address?.district || "-"
            }
          />

        </InfoCard>

      </div>

      {/* FEE INFORMATION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <IndianRupee size={21} />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Fee Information
                </h2>

                <p className="text-sm text-slate-400">
                  Current payment status
                </p>

              </div>

            </div>

          </div>

          <button
            onClick={() => navigate("/payments")}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Record Payment
          </button>

        </div>

        {/* FEE CARDS */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <FeeBox
            label="Total Fee"
            amount={totalFee}
            type="total"
          />

          <FeeBox
            label="Amount Paid"
            amount={totalPaid}
            type="paid"
          />

          <FeeBox
            label="Balance"
            amount={balance}
            type="balance"
          />

        </div>

        {/* PROGRESS */}
        <div className="mt-7">

          <div className="mb-2 flex justify-between">

            <span className="text-sm font-medium text-slate-600">
              Payment Progress
            </span>

            <span className="text-sm font-bold text-indigo-600">
              {progress}%
            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{
                width: `${progress}%`
              }}
            />

          </div>

        </div>

        {/* PAYMENT STATUS */}
        <div className="mt-6">

          {balance === 0 && totalFee > 0 ? (

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              ✓ Fee fully paid
            </div>

          ) : totalPaid > 0 ? (

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              Partial payment — ₹
              {balance.toLocaleString("en-IN")}
              {" "}remaining
            </div>

          ) : (

            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              No payment recorded yet
            </div>

          )}

        </div>

      </div>

      {/* NOTES */}
      {student.notes && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="font-semibold text-slate-900">
            Notes
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-500">
            {student.notes}
          </p>

        </div>
      )}

    </div>
  );
}

/* INFO CARD */
function InfoCard({
  title,
  icon: Icon,
  children
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          <Icon size={19} />
        </div>

        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

      </div>

      <div className="divide-y divide-slate-100 px-6">
        {children}
      </div>

    </div>
  );
}

/* INFO ROW */
function InfoRow({
  label,
  value
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-700">
        {value || "-"}
      </span>

    </div>
  );
}

/* FEE BOX */
function FeeBox({
  label,
  amount,
  type
}) {
  const styles = {
    total: "border-slate-200 bg-slate-50 text-slate-900",
    paid: "border-emerald-100 bg-emerald-50 text-emerald-700",
    balance: "border-amber-200 bg-amber-50 text-amber-700"
  };

  return (
    <div
      className={`rounded-xl border p-5 ${styles[type]}`}
    >

      <p className="text-sm font-medium opacity-80">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        ₹{Number(amount || 0).toLocaleString("en-IN")}
      </p>

    </div>
  );
}

export default StudentDetails;