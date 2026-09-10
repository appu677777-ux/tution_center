import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CreditCard,
  IndianRupee,
  Loader2,
  RefreshCw,
  Receipt,
  User,
  Trash2
} from "lucide-react";

import { api } from "../services/api";

function PaymentDashboard() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [feeSummary, setFeeSummary] = useState(null);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD STUDENTS
  // ==========================================

  const loadStudents = async () => {
    try {
      const data = await api("/students");

      const studentList = Array.isArray(data)
        ? data
        : data.students || [];

      setStudents(studentList);
    } catch (err) {
      setError(
        err.message || "Unable to load students"
      );
    }
  };

  // ==========================================
  // LOAD ALL PAYMENT HISTORY
  // ==========================================

  const loadPayments = async () => {
    try {
      setHistoryLoading(true);

      const data = await api("/payments");

      const paymentList = Array.isArray(data)
        ? data
        : data.payments || [];

      setPayments(paymentList);
    } catch (err) {
      setError(
        err.message || "Unable to load payment history"
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api(`/payments/${paymentId}`, {
        method: "DELETE"
      });

      setSuccess("Payment deleted successfully.");

      await loadPayments();
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to delete payment."
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        loadStudents(),
        loadPayments()
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ==========================================
  // SEARCH STUDENTS
  // ==========================================

  const filteredStudents = useMemo(() => {
    const text = search
      .toLowerCase()
      .trim();

    if (!text) return [];

    return students
      .filter((student) => {
        return (
          student.name
            ?.toLowerCase()
            .includes(text) ||
          student.studentId
            ?.toLowerCase()
            .includes(text) ||
          student.admissionNumber
            ?.toLowerCase()
            .includes(text) ||
          student.phone
            ?.toLowerCase()
            .includes(text) ||
          student.parentPhone
            ?.toLowerCase()
            .includes(text)
        );
      })
      .slice(0, 8);
  }, [students, search]);

  // ==========================================
  // SELECT STUDENT
  // ==========================================

  const selectStudent = async (student) => {
    try {
      setSelectedStudent(student);
      setSearch(student.name || "");
      setError("");
      setSuccess("");

      const data = await api(
        `/payments/student/${student._id}`
      );

      setFeeSummary(data.feeSummary);
    } catch (err) {
      setError(
        err.message || "Unable to load fee details"
      );
    }
  };

  // ==========================================
  // RECORD PAYMENT
  // ==========================================

  const handlePayment = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedStudent) {
      setError("Please select a student");
      return;
    }

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Enter a valid payment amount");
      return;
    }

    if (
      feeSummary &&
      paymentAmount > Number(feeSummary.balance)
    ) {
      setError(
        `Payment cannot exceed the remaining balance of ₹${Number(
          feeSummary.balance
        ).toLocaleString("en-IN")}`
      );

      return;
    }

    try {
      setPaymentLoading(true);

      await api("/payments", {
        method: "POST",

        body: JSON.stringify({
          studentId: selectedStudent._id,
          amount: paymentAmount,
          paymentMethod,
          paymentDate,
          remarks
        })
      });

      setSuccess(
        "Payment recorded successfully."
      );

      setAmount("");
      setRemarks("");

      // Refresh fee information
      const feeData = await api(
        `/payments/student/${selectedStudent._id}`
      );

      setFeeSummary(feeData.feeSummary);

      // Refresh payment history
      await loadPayments();
    } catch (err) {
      setError(
        err.message || "Unable to record payment"
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // ==========================================
  // REFRESH EVERYTHING
  // ==========================================

  const handleRefresh = async () => {
    setError("");

    await Promise.all([
      loadStudents(),
      loadPayments()
    ]);

    if (selectedStudent) {
      try {
        const data = await api(
          `/payments/student/${selectedStudent._id}`
        );

        setFeeSummary(data.feeSummary);
      } catch (err) {
        setError(
          err.message || "Unable to refresh fee details"
        );
      }
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
            Loading payments...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-medium text-indigo-600">
            Payments
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Payment Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Record student payments and view payment history.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ {success}
        </div>
      )}

      {/* ======================================
          QUICK PAYMENT
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <CreditCard size={21} />
          </div>

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Quick Payment
            </h2>

            <p className="text-sm text-slate-400">
              Search for a student and record a payment.
            </p>

          </div>

        </div>

        {/* SEARCH */}

        <div className="relative mt-6">

          <div className="flex items-center rounded-xl border border-slate-200 bg-white">

            <Search
              size={19}
              className="ml-4 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);

                if (!e.target.value) {
                  setSelectedStudent(null);
                  setFeeSummary(null);
                }
              }}
              placeholder="Search student by name, ID, admission number or phone..."
              className="w-full rounded-xl border-0 px-3 py-3.5 text-sm outline-none"
            />

          </div>

          {/* SEARCH RESULTS */}

          {search &&
            !selectedStudent &&
            filteredStudents.length > 0 && (

              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                {filteredStudents.map((student) => (

                  <button
                    key={student._id}
                    onClick={() =>
                      selectStudent(student)
                    }
                    className="flex w-full items-center gap-4 border-b border-slate-100 px-4 py-4 text-left last:border-0 hover:bg-slate-50"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                      {student.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold text-slate-900">
                        {student.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {student.studentId}
                        {" • "}
                        {student.admissionNumber}
                      </p>

                    </div>

                  </button>

                ))}

              </div>
            )}

        </div>

        {/* SELECTED STUDENT */}

        {selectedStudent && (

          <div className="mt-6">

            {/* STUDENT */}

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white font-bold text-indigo-600 shadow-sm">
                  {selectedStudent.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>

                  <p className="font-semibold text-slate-900">
                    {selectedStudent.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {selectedStudent.studentId}
                    {" • "}
                    {selectedStudent.admissionNumber}
                  </p>

                </div>

              </div>

            </div>

            {/* FEE SUMMARY */}

            {feeSummary && (

              <div className="mt-4 grid gap-4 sm:grid-cols-3">

                <FeeCard
                  label="Total Fee"
                  amount={feeSummary.totalFee}
                  className="bg-slate-50 border-slate-200 text-slate-900"
                />

                <FeeCard
                  label="Amount Paid"
                  amount={feeSummary.totalPaid}
                  className="bg-emerald-50 border-emerald-100 text-emerald-700"
                />

                <FeeCard
                  label="Balance"
                  amount={feeSummary.balance}
                  className="bg-amber-50 border-amber-200 text-amber-700"
                />

              </div>

            )}

            {/* PAYMENT FORM */}

            {feeSummary &&
              Number(feeSummary.balance) > 0 && (

                <form
                  onSubmit={handlePayment}
                  className="mt-6"
                >

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* AMOUNT */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Payment Amount
                      </label>

                      <div className="flex items-center rounded-xl border border-slate-200">

                        <IndianRupee
                          size={17}
                          className="ml-4 text-slate-400"
                        />

                        <input
                          type="number"
                          min="1"
                          max={feeSummary.balance}
                          value={amount}
                          onChange={(e) =>
                            setAmount(e.target.value)
                          }
                          placeholder="Enter amount"
                          className="w-full rounded-xl border-0 px-3 py-3.5 outline-none"
                          required
                        />

                      </div>

                    </div>

                    {/* PAYMENT METHOD */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Payment Method
                      </label>

                      <select
                        value={paymentMethod}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
                      >

                        <option value="Cash">
                          Cash
                        </option>

                        <option value="GPay">
                          GPay
                        </option>

                      </select>

                    </div>

                    {/* DATE */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Payment Date
                      </label>

                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) =>
                          setPaymentDate(e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none"
                      />

                    </div>

                    {/* REMARKS */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Remarks
                      </label>

                      <input
                        value={remarks}
                        onChange={(e) =>
                          setRemarks(e.target.value)
                        }
                        placeholder="Optional"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none"
                      />

                    </div>

                  </div>

                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >

                    {paymentLoading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Recording...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Record Payment
                      </>
                    )}

                  </button>

                </form>

              )}

            {/* FULLY PAID */}

            {feeSummary &&
              Number(feeSummary.balance) === 0 && (

                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700">
                  ✓ This student's fee is fully paid.
                </div>

              )}

          </div>

        )}

      </div>

      {/* ======================================
          ALL PAYMENT HISTORY
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HISTORY HEADER */}

        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Receipt size={21} />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Payment History
              </h2>

              <p className="text-sm text-slate-400">
                All student payments
              </p>

            </div>

          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {payments.length} payments
          </span>

        </div>

        {/* HISTORY */}

        {historyLoading ? (

          <div className="flex items-center justify-center py-12">

            <Loader2
              size={28}
              className="animate-spin text-indigo-600"
            />

          </div>

        ) : payments.length === 0 ? (

          <div className="py-12 text-center">

            <Receipt
              size={35}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-500">
              No payments recorded yet.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Student ID
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Method
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Receipt
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {payments.map((payment) => {

                  const student =
                    payment.studentId &&
                      typeof payment.studentId === "object"
                      ? payment.studentId
                      : null;

                  return (
                    <tr
                      key={payment._id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* DATE */}

                      <td className="px-6 py-4 text-sm text-slate-600">

                        {payment.paymentDate
                          ? new Date(
                            payment.paymentDate
                          ).toLocaleDateString(
                            "en-IN"
                          )
                          : "-"}

                      </td>

                      {/* STUDENT */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                            {student?.name
                              ?.charAt(0)
                              ?.toUpperCase() || (
                                <User size={16} />
                              )}
                          </div>

                          <span className="text-sm font-semibold text-slate-800">
                            {student?.name || "Student"}
                          </span>

                        </div>

                      </td>

                      {/* STUDENT ID */}

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {student?.studentId || "-"}
                      </td>

                      {/* AMOUNT */}

                      <td className="px-6 py-4">

                        <span className="text-sm font-bold text-slate-900">
                          ₹
                          {Number(
                            payment.amount || 0
                          ).toLocaleString("en-IN")}
                        </span>

                      </td>

                      {/* METHOD */}

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.paymentMethod ===
                            "GPay"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-emerald-50 text-emerald-600"
                            }`}
                        >
                          {payment.paymentMethod}
                        </span>

                      </td>

                      {/* RECEIPT */}

                      <td className="px-6 py-4">

                        <span className="text-sm font-medium text-slate-600">
                          {payment.receiptNumber ||
                            "-"}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleDeletePayment(payment._id)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          title="Delete payment"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

/* ==========================================
   FEE CARD
========================================== */

function FeeCard({
  label,
  amount,
  className
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${className}`}
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

export default PaymentDashboard;