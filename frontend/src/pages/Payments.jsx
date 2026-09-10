import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  IndianRupee,
  Plus,
  Loader2,
  X,
  Receipt,
  Banknote,
  Smartphone
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

function Payments() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [feeSummary, setFeeSummary] = useState({
    totalFee: 0,
    totalPaid: 0,
    balance: 0
  });
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    paymentMethod: "Cash",
    paymentDate: "",
    remarks: ""
  });

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * The backend returns the student fee summary
       * and payment history.
       */
      const data = await api(
        `/payments/student/${id}`
      );

      setStudent(data.student);

      setFeeSummary(
        data.feeSummary || {
          totalFee: 0,
          totalPaid: 0,
          balance: 0
        }
      );

      setPayments(data.payments || []);

    } catch (error) {
      setError(
        error.message ||
        "Unable to load payment information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [id]);

  const totalFee = Number(
    feeSummary.totalFee || 0
  );

  const amountPaid = Number(
    feeSummary.totalPaid || 0
  );

  const balance = Number(
    feeSummary.balance || 0
  );

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

    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (amount > balance) {
      setError(
        `Payment cannot exceed the remaining balance of ₹${balance.toLocaleString(
          "en-IN"
        )}.`
      );
      return;
    }

    try {
      setSaving(true);

      await api("/payments", {
        method: "POST",
        body: JSON.stringify({
          studentId: id,
          amount,
          paymentMethod: form.paymentMethod,
          paymentDate:
            form.paymentDate || undefined,
          remarks:
            form.remarks.trim() || undefined
        })
      });

      setForm({
        amount: "",
        paymentMethod: "Cash",
        paymentDate: "",
        remarks: ""
      });

      setShowForm(false);

      await loadPayments();

    } catch (error) {
      setError(
        error.message ||
        "Unable to record payment."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading payments...
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold">
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

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                navigate(`/students/${id}`)
              }
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div>

              <p className="text-sm font-medium text-indigo-600">
                Fee Management
              </p>

              <h1 className="text-xl font-bold">
                Payment History
              </h1>

            </div>

          </div>

          {balance > 0 && (
            <button
              onClick={() => {
                setError("");
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
            >
              <Plus size={18} />

              <span className="hidden sm:inline">
                Add Payment
              </span>
            </button>
          )}

        </div>

      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* ERROR */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-4"
            >
              <X size={17} />
            </button>

          </div>
        )}

        {/* STUDENT */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-600">
              {student.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>

              <h2 className="text-lg font-bold">
                {student.name}
              </h2>

              <p className="text-sm text-slate-400">
                {student.studentId} •{" "}
                {student.course}
              </p>

            </div>

          </div>

        </div>

        {/* FEE SUMMARY */}
        <div className="grid gap-4 sm:grid-cols-3">

          <FeeCard
            label="Total Fee"
            value={totalFee}
            icon={IndianRupee}
            type="total"
          />

          <FeeCard
            label="Amount Paid"
            value={amountPaid}
            icon={CreditCard}
            type="paid"
          />

          <FeeCard
            label="Balance"
            value={balance}
            icon={Banknote}
            type="balance"
          />

        </div>

        {/* PROGRESS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-3 flex items-center justify-between">

            <span className="text-sm font-medium text-slate-600">
              Fee Collection
            </span>

            <span className="text-sm font-bold text-indigo-600">
              {totalFee > 0
                ? Math.min(
                  Math.round(
                    (amountPaid / totalFee) * 100
                  ),
                  100
                )
                : 0}
              %
            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{
                width: `${totalFee > 0
                  ? Math.min(
                    (amountPaid / totalFee) * 100,
                    100
                  )
                  : 0
                  }%`
              }}
            />

          </div>

        </div>

        {/* PAYMENT HISTORY */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-5">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Receipt size={20} />
              </div>

              <div>

                <h2 className="font-semibold">
                  Payment History
                </h2>

                <p className="text-xs text-slate-400">
                  {payments.length} payment
                  {payments.length !== 1
                    ? "s"
                    : ""} recorded
                </p>

              </div>

            </div>

          </div>

          {payments.length === 0 ? (

            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">

              <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                <CreditCard size={30} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-700">
                No payments yet
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Record the student's first payment.
              </p>

              {balance > 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus size={17} />
                  Add Payment
                </button>
              )}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[650px]">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs uppercase tracking-wider text-slate-400">

                    <th className="px-5 py-4 font-medium">
                      Receipt
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Amount
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Payment Method
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Date
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Remarks
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {payments.map((payment) => (

                    <tr
                      key={payment._id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Receipt
                            size={17}
                            className="text-slate-400"
                          />

                          <span className="text-sm font-medium text-slate-700">
                            {payment.receiptNumber}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <span className="text-sm font-bold text-slate-900">
                          ₹
                          {Number(
                            payment.amount
                          ).toLocaleString("en-IN")}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <PaymentMethod
                          method={
                            payment.paymentMethod
                          }
                        />

                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">

                        {payment.paymentDate
                          ? new Date(
                            payment.paymentDate
                          ).toLocaleDateString(
                            "en-IN"
                          )
                          : "-"}

                      </td>

                      <td className="max-w-[200px] px-5 py-4 text-sm text-slate-500">

                        {payment.remarks || "-"}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

      {/* PAYMENT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h2 className="text-lg font-bold">
                  Record Payment
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Balance remaining: ₹
                  {balance.toLocaleString("en-IN")}
                </p>

              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* AMOUNT */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Amount
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="amount"
                    min="1"
                    max={balance}
                    step="1"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="5000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  />

                </div>

              </div>

              {/* PAYMENT METHOD */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        paymentMethod: "Cash"
                      }))
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${form.paymentMethod === "Cash"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    <Banknote size={19} />
                    Cash
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        paymentMethod: "GPay"
                      }))
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${form.paymentMethod === "GPay"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    <Smartphone size={19} />
                    GPay
                  </button>

                </div>

              </div>

              {/* DATE */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Date
                </label>

                <input
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />

              </div>

              {/* REMARKS */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Remarks
                </label>

                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Optional remarks..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />

              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60"
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
                      <Plus size={18} />
                      Record Payment
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}


/* ============================= */
/* FEE CARD */
/* ============================= */

function FeeCard({
  label,
  value,
  icon: Icon,
  type
}) {
  const styles = {
    total: "bg-indigo-50 text-indigo-600",
    paid: "bg-emerald-50 text-emerald-600",
    balance: "bg-amber-50 text-amber-600"
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹{value.toLocaleString("en-IN")}
          </p>

        </div>

        <div className={`rounded-xl p-3 ${styles[type]}`}>
          <Icon size={21} />
        </div>

      </div>

    </div>
  );
}


/* ============================= */
/* PAYMENT METHOD */
/* ============================= */

function PaymentMethod({ method }) {
  const isGPay = method === "GPay";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isGPay
        ? "bg-blue-50 text-blue-600"
        : "bg-emerald-50 text-emerald-600"
        }`}
    >
      {isGPay ? (
        <Smartphone size={14} />
      ) : (
        <Banknote size={14} />
      )}

      {method}
    </span>
  );
}

export default Payments;