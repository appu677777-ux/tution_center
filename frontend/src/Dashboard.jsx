import { useEffect, useState } from "react";
import {
  Users,
  CreditCard,
  BarChart3,
  IndianRupee,
  Wallet,
  UserCheck,
  ArrowUpRight,
  MoreHorizontal,
  Loader2,
  RefreshCw
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { api } from "./services/api";

function Dashboard({ staff }) {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsResponse, paymentsResponse] =
        await Promise.all([
          api("/students"),
          api("/payments")
        ]);

      // -----------------------------
      // STUDENTS
      // -----------------------------

      const studentList = Array.isArray(studentsResponse)
        ? studentsResponse
        : studentsResponse.students || [];

      // -----------------------------
      // PAYMENTS
      // -----------------------------

      const paymentList = Array.isArray(paymentsResponse)
        ? paymentsResponse
        : paymentsResponse.payments || [];

      setStudents(studentList);
      setPayments(paymentList);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================
  // CALCULATE STUDENT VALUES
  // ==========================================

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) =>
      student.status === "Active"
  ).length;

  // ==========================================
  // CALCULATE FEE VALUES
  // ==========================================

  const totalFee = students.reduce(
    (total, student) =>
      total + Number(student.totalFee || 0),
    0
  );

  const feeCollected = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const outstanding = Math.max(
    totalFee - feeCollected,
    0
  );

  const collectionProgress =
    totalFee > 0
      ? Math.min(
          Math.round(
            (feeCollected / totalFee) * 100
          ),
          100
        )
      : 0;

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  // ==========================================
  // GET STUDENT FROM PAYMENT
  // ==========================================

  const getStudentFromPayment = (payment) => {
    if (
      payment.studentId &&
      typeof payment.studentId === "object"
    ) {
      return payment.studentId;
    }

    const studentId = payment.studentId;

    return students.find(
      (student) =>
        student._id === studentId
    );
  };

  // ==========================================
  // RECENT PAYMENTS
  // ==========================================

  const recentPayments = [...payments]
    .sort(
      (a, b) =>
        new Date(b.paymentDate || b.createdAt) -
        new Date(a.paymentDate || a.createdAt)
    )
    .slice(0, 5);

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
            Loading dashboard...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ======================================
          PAGE TITLE
      ====================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="mb-1 text-sm font-medium text-indigo-600">
            Overview
          </p>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Overall Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {staff?.name || "Staff"}.
            Here's what's happening with your tuition
            center today.
          </p>

        </div>

        <button
          onClick={loadDashboard}
          className="flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>

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
          STAT CARDS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL STUDENTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Students
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {totalStudents}
              </h3>

            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Users size={22} />
            </div>

          </div>

          <div className="mt-4 text-xs font-medium text-slate-400">
            All registered students
          </div>

        </div>

        {/* ACTIVE STUDENTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Active Students
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {activeStudents}
              </h3>

            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserCheck size={22} />
            </div>

          </div>

          <div className="mt-4 text-xs font-medium text-slate-400">
            Currently enrolled
          </div>

        </div>

        {/* FEE COLLECTED */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Fee Collected
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {formatMoney(feeCollected)}
              </h3>

            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <IndianRupee size={22} />
            </div>

          </div>

          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight size={15} />
            <span>
              Total payments received
            </span>
          </div>

        </div>

        {/* OUTSTANDING */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Outstanding Fee
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {formatMoney(outstanding)}
              </h3>

            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Wallet size={22} />
            </div>

          </div>

          <div className="mt-4 text-xs font-medium text-amber-600">
            Remaining student fees
          </div>

        </div>

      </div>

      {/* ======================================
          LOWER SECTION
      ====================================== */}

      <div className="grid gap-6 xl:grid-cols-3">

        {/* ====================================
            RECENT PAYMENTS
        ==================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div>

              <h3 className="font-semibold">
                Recent Payments
              </h3>

              <p className="mt-0.5 text-xs text-slate-400">
                Latest fee transactions
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/payments")
              }
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all
            </button>

          </div>

          <div className="overflow-x-auto">

            {recentPayments.length === 0 ? (

              <div className="py-12 text-center">

                <CreditCard
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-500">
                  No payments recorded yet.
                </p>

              </div>

            ) : (

              <table className="w-full min-w-[650px]">

                <thead>

                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">

                    <th className="px-5 py-3 font-medium">
                      Student
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Amount
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Method
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Date
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Receipt
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentPayments.map(
                    (payment) => {

                      const student =
                        getStudentFromPayment(
                          payment
                        );

                      return (
                        <tr
                          key={payment._id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                        >

                          {/* STUDENT */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                                {student?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "?"}
                              </div>

                              <div>

                                <p className="text-sm font-medium">
                                  {student?.name ||
                                    "Unknown Student"}
                                </p>

                                <p className="text-xs text-slate-400">
                                  {student?.studentId ||
                                    "-"}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* AMOUNT */}

                          <td className="px-5 py-4 text-sm font-semibold">
                            {formatMoney(
                              payment.amount
                            )}
                          </td>

                          {/* METHOD */}

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                payment.paymentMethod ===
                                "GPay"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {payment.paymentMethod ||
                                "-"}
                            </span>

                          </td>

                          {/* DATE */}

                          <td className="px-5 py-4 text-xs text-slate-500">
                            {formatDate(
                              payment.paymentDate ||
                                payment.createdAt
                            )}
                          </td>

                          {/* RECEIPT */}

                          <td className="px-5 py-4 text-xs font-medium text-slate-600">
                            {payment.receiptNumber ||
                              "-"}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            )}

          </div>

        </div>

        {/* ====================================
            FEE OVERVIEW
        ==================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-semibold">
                Fee Overview
              </h3>

              <p className="mt-0.5 text-xs text-slate-400">
                Current student fee collection
              </p>

            </div>

            <MoreHorizontal
              size={19}
              className="text-slate-400"
            />

          </div>

          {/* PROGRESS */}

          <div className="mt-8">

            <div className="mb-2 flex justify-between text-sm">

              <span className="font-medium text-slate-600">
                Collection Progress
              </span>

              <span className="font-semibold text-indigo-600">
                {collectionProgress}%
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                style={{
                  width: `${collectionProgress}%`
                }}
              />

            </div>

          </div>

          {/* DETAILS */}

          <div className="mt-8 space-y-4">

            {/* COLLECTED */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="h-3 w-3 rounded-full bg-indigo-600" />

                <span className="text-sm text-slate-500">
                  Collected
                </span>

              </div>

              <span className="text-sm font-semibold">
                {formatMoney(feeCollected)}
              </span>

            </div>

            {/* OUTSTANDING */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="h-3 w-3 rounded-full bg-amber-400" />

                <span className="text-sm text-slate-500">
                  Outstanding
                </span>

              </div>

              <span className="text-sm font-semibold">
                {formatMoney(outstanding)}
              </span>

            </div>

            {/* TOTAL */}

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">

              <span className="text-sm font-medium text-slate-600">
                Total Fee
              </span>

              <span className="text-lg font-bold">
                {formatMoney(totalFee)}
              </span>

            </div>

          </div>

          {/* <button
            onClick={() =>
              navigate("/reports")
            }
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <BarChart3 size={17} />
            View Full Report
          </button> */}

        </div>

      </div>

      {/* ======================================
          QUICK ACTIONS
      ====================================== */}

      <div>

        <h3 className="mb-4 text-sm font-semibold text-slate-700">
          Quick Actions
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">

          {/* ADD STUDENT */}

          <button
            onClick={() =>
              navigate("/students/add")
            }
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Users size={20} />
            </div>

            <div>

              <p className="text-sm font-semibold">
                Add Student
              </p>

              <p className="text-xs text-slate-400">
                Register a new student
              </p>

            </div>

          </button>

          {/* RECORD PAYMENT */}

          <button
            onClick={() =>
              navigate("/payments")
            }
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CreditCard size={20} />
            </div>

            <div>

              <p className="text-sm font-semibold">
                Record Payment
              </p>

              <p className="text-xs text-slate-400">
                Add a fee payment
              </p>

            </div>

          </button>

          {/* REPORT */}

          {/* <button
            onClick={() =>
              navigate("/reports")
            }
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <BarChart3 size={20} />
            </div>

            <div>

              <p className="text-sm font-semibold">
                Extra function
              </p>

              <p className="text-xs text-slate-400">
                Extra Button
              </p>

            </div>

          </button> */}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;