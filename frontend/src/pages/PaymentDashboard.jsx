import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import { api } from "../services/api";

const PaymentDashboard = () => {
  // =====================================================
  // STATES
  // =====================================================

  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [feeSummary, setFeeSummary] =
    useState(null);

  const [feeStructure, setFeeStructure] =
    useState(null);

  const [selectedFee, setSelectedFee] =
    useState(null);

  const [amount, setAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [paymentDate, setPaymentDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [remarks, setRemarks] =
    useState("");

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [loadingPayments, setLoadingPayments] =
    useState(false);

  const [loadingStudentDetails, setLoadingStudentDetails] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      setError("");

      const response =
        await api("/students");

      /*
        Your api.js returns JSON directly.
        It does NOT return Axios response.data.
      */

      setStudents(
        response?.students ||
        (Array.isArray(response)
          ? response
          : [])
      );

    } catch (err) {
      console.error(
        "Load students error:",
        err
      );

      setError(
        err.message ||
        "Failed to load students"
      );

    } finally {
      setLoadingStudents(false);
    }
  };

  // =====================================================
  // LOAD ALL PAYMENTS
  // =====================================================

  const loadPayments = async () => {
    try {
      setLoadingPayments(true);

      const response =
        await api("/payments");

      setPayments(
        response?.payments ||
        []
      );

    } catch (err) {
      console.error(
        "Load payments error:",
        err
      );

      setError(
        err.message ||
        "Failed to load payments"
      );

    } finally {
      setLoadingPayments(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadStudents();
    loadPayments();
  }, []);

  // =====================================================
  // SEARCH STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    const value =
      search
        .trim()
        .toLowerCase();

    if (!value) {
      return students;
    }

    return students.filter(
      (student) => {
        return (
          student.name
            ?.toLowerCase()
            .includes(value) ||

          student.studentId
            ?.toLowerCase()
            .includes(value) ||

          student.admissionNumber
            ?.toLowerCase()
            .includes(value) ||

          student.phone
            ?.toLowerCase()
            .includes(value) ||

          student.batch
            ?.toLowerCase()
            .includes(value) ||

          student.standard
            ?.toString()
            .toLowerCase()
            .includes(value)
        );
      }
    );
  }, [students, search]);

  // =====================================================
  // LOAD STUDENT PAYMENT DETAILS
  // =====================================================

  const loadStudentDetails = async (
    studentId
  ) => {
    try {
      setLoadingStudentDetails(true);

      const response =
        await api(
          `/payments/student/${studentId}`
        );

      setFeeSummary(
        response?.feeSummary ||
        null
      );

      setFeeStructure(
        response?.feeStructure ||
        null
      );

    } catch (err) {
      console.error(
        "Load student payment details:",
        err
      );

      setFeeSummary(null);
      setFeeStructure(null);

      setError(
        err.message ||
        "Failed to load student payment details"
      );

    } finally {
      setLoadingStudentDetails(false);
    }
  };

  // =====================================================
  // SELECT STUDENT
  // =====================================================

  const selectStudent = async (
    student
  ) => {
    setSelectedStudent(student);

    setSelectedFee(null);
    setAmount("");
    setError("");
    setSuccess("");

    await loadStudentDetails(
      student._id
    );
  };

  // =====================================================
  // FEE TYPE
  // =====================================================

  const feeType =
    feeStructure?.type ||
    selectedStudent
      ?.feeStructure
      ?.type ||
    "custom";

  // =====================================================
  // SELECT MONTH
  // =====================================================

  const selectMonth = (month) => {
    const balance =
      Number(month.balance || 0);

    setSelectedFee({
      type: "monthly",

      reference:
        month.month,

      label:
        month.month,

      amount:
        Number(month.amount || 0),

      paid:
        Number(month.paid || 0),

      balance,

      status:
        month.status ||
        "Pending"
    });

    setAmount(
      balance > 0
        ? balance
        : ""
    );

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SELECT INSTALLMENT
  // =====================================================

  const selectInstallment = (
    installment
  ) => {
    const balance =
      Number(
        installment.balance || 0
      );

    setSelectedFee({
      type: "installment",

      reference:
        installment.installmentNumber,

      label:
        installment.title ||
        `Installment ${installment.installmentNumber}`,

      amount:
        Number(
          installment.amount || 0
        ),

      paid:
        Number(
          installment.paid || 0
        ),

      balance,

      status:
        installment.status ||
        "Pending"
    });

    setAmount(
      balance > 0
        ? balance
        : ""
    );

    setError("");
    setSuccess("");
  };

  // =====================================================
  // AMOUNT CHANGE
  // =====================================================

  const handleAmountChange = (
    e
  ) => {
    let value =
      e.target.value;

    if (value === "") {
      setAmount("");
      return;
    }

    value = Number(value);

    if (isNaN(value)) {
      return;
    }

    const maxBalance =
      selectedFee
        ? Number(
            selectedFee.balance
          )
        : Number(
            feeSummary?.balance ||
            0
          );

    if (
      value > maxBalance
    ) {
      value = maxBalance;
    }

    setAmount(value);
  };

  // =====================================================
  // ADD PAYMENT
  // =====================================================

  const handlePayment = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------------
    // STUDENT
    // ---------------------------------------------------

    if (!selectedStudent) {
      setError(
        "Please select a student"
      );
      return;
    }

    // ---------------------------------------------------
    // MONTH / INSTALLMENT
    // ---------------------------------------------------

    if (
      feeType === "monthly" ||
      feeType === "installment"
    ) {
      if (!selectedFee) {
        setError(
          feeType === "monthly"
            ? "Please select a month"
            : "Please select an installment"
        );

        return;
      }

      if (
        Number(
          selectedFee.balance
        ) <= 0
      ) {
        setError(
          "This fee is already fully paid"
        );

        return;
      }
    }

    // ---------------------------------------------------
    // AMOUNT
    // ---------------------------------------------------

    const paymentAmount =
      Number(amount);

    if (
      !paymentAmount ||
      paymentAmount <= 0
    ) {
      setError(
        "Please enter a valid payment amount"
      );

      return;
    }

    const availableBalance =
      selectedFee
        ? Number(
            selectedFee.balance
          )
        : Number(
            feeSummary?.balance ||
            0
          );

    if (
      paymentAmount >
      availableBalance
    ) {
      setError(
        `Payment cannot be greater than balance of ₹${availableBalance}`
      );

      return;
    }

    // ---------------------------------------------------
    // PAYMENT DATA
    // ---------------------------------------------------

    const paymentData = {
      studentId:
        selectedStudent._id,

      amount:
        paymentAmount,

      paymentMethod,

      paymentDate,

      remarks
    };

    // ---------------------------------------------------
    // MONTHLY
    // ---------------------------------------------------

    if (
      feeType === "monthly"
    ) {
      paymentData.feeType =
        "monthly";

      paymentData.feeReference =
        selectedFee.reference;
    }

    // ---------------------------------------------------
    // INSTALLMENT
    // ---------------------------------------------------

    else if (
      feeType ===
      "installment"
    ) {
      paymentData.feeType =
        "installment";

      paymentData.feeReference =
        String(
          selectedFee.reference
        );
    }

    // ---------------------------------------------------
    // CUSTOM
    // ---------------------------------------------------

    else {
      paymentData.feeType =
        "custom";

      paymentData.feeReference =
        "";
    }

    try {
      setSubmitting(true);

      // =================================================
      // POST PAYMENT
      // =================================================

      const response =
        await api(
          "/payments",
          {
            method: "POST",

            body:
              JSON.stringify(
                paymentData
              )
          }
        );

      setSuccess(
        response?.message ||
        "Payment added successfully"
      );

      // -------------------------------------------------
      // RESET
      // -------------------------------------------------

      setAmount("");
      setRemarks("");
      setSelectedFee(null);

      // -------------------------------------------------
      // REFRESH STUDENT FEE
      // -------------------------------------------------

      await loadStudentDetails(
        selectedStudent._id
      );

      // -------------------------------------------------
      // REFRESH PAYMENT HISTORY
      // -------------------------------------------------

      await loadPayments();

    } catch (err) {
      console.error(
        "Add payment error:",
        err
      );

      setError(
        err.message ||
        "Failed to add payment"
      );

    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE PAYMENT
  // =====================================================

  const deletePayment = async (
    paymentId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this payment?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api(
        `/payments/${paymentId}`,
        {
          method: "DELETE"
        }
      );

      setSuccess(
        "Payment deleted successfully"
      );

      // -------------------------------------------------
      // REFRESH PAYMENTS
      // -------------------------------------------------

      await loadPayments();

      // -------------------------------------------------
      // REFRESH STUDENT FEE
      // -------------------------------------------------

      if (selectedStudent) {
        await loadStudentDetails(
          selectedStudent._id
        );

        setSelectedFee(null);
        setAmount("");
      }

    } catch (err) {
      console.error(
        "Delete payment error:",
        err
      );

      setError(
        err.message ||
        "Failed to delete payment"
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  // =====================================================
  // CURRENCY
  // =====================================================

  const currency = (
    value
  ) => {
    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    )}`;
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const statusClass = (
    status
  ) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Partial":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-red-100 text-red-700";
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Payment Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Manage student fees and payment history
        </p>

      </div>

      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex justify-between gap-3">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="font-bold"
          >
            ×
          </button>

        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 flex justify-between gap-3">

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            className="font-bold"
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* =================================================
            STUDENT LIST
        ================================================= */}

        <div className="bg-white rounded-xl shadow-sm border">

          <div className="p-4 border-b">

            <h2 className="font-semibold text-lg text-gray-800 mb-3">
              Students
            </h2>

            <input
              type="text"
              placeholder="Search name, ID, phone..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <div className="max-h-[600px] overflow-y-auto">

            {loadingStudents ? (

              <div className="p-6 text-center text-gray-500">
                Loading students...
              </div>

            ) : filteredStudents.length ===
              0 ? (

              <div className="p-6 text-center text-gray-500">
                No students found
              </div>

            ) : (

              filteredStudents.map(
                (student) => (

                  <button
                    key={
                      student._id
                    }
                    type="button"
                    onClick={() =>
                      selectStudent(
                        student
                      )
                    }
                    className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${
                      selectedStudent?._id ===
                      student._id
                        ? "bg-blue-50 border-l-4 border-l-blue-600"
                        : ""
                    }`}
                  >

                    <div className="flex justify-between gap-3">

                      <div>

                        <p className="font-semibold text-gray-800">
                          {student.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {student.studentId}
                        </p>

                      </div>

                      {student.standard && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded h-fit">
                          Class{" "}
                          {
                            student.standard
                          }
                        </span>
                      )}

                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      {student.course ||
                        "-"}{" "}

                      {student.batch
                        ? `• Batch ${student.batch}`
                        : ""}
                    </p>

                  </button>
                )
              )
            )}

          </div>

        </div>

        {/* =================================================
            PAYMENT SECTION
        ================================================= */}

        <div className="xl:col-span-2 space-y-6">

          {!selectedStudent ? (

            <div className="bg-white rounded-xl shadow-sm border p-10 text-center">

              <div className="text-5xl mb-4">
                💳
              </div>

              <h2 className="text-xl font-semibold text-gray-700">
                Select a student
              </h2>

              <p className="text-gray-500 mt-2">
                Select a student from the list to manage
                their fees and payments.
              </p>

            </div>

          ) : (

            <>
              {/* =================================================
                  STUDENT HEADER
              ================================================= */}

              <div className="bg-white rounded-xl shadow-sm border p-5">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <h2 className="text-xl font-bold text-gray-800">
                      {
                        selectedStudent.name
                      }
                    </h2>

                    <p className="text-gray-500">
                      {
                        selectedStudent.studentId
                      }
                    </p>

                  </div>

                  <div className="flex gap-2 flex-wrap">

                    {selectedStudent.standard && (
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                        Class{" "}
                        {
                          selectedStudent.standard
                        }
                      </span>
                    )}

                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                      {
                        selectedStudent.course ||
                        "Student"
                      }
                    </span>

                  </div>

                </div>

              </div>

              {/* =================================================
                  LOADING STUDENT DETAILS
              ================================================= */}

              {loadingStudentDetails ? (

                <div className="bg-white border rounded-xl p-8 text-center text-gray-500">

                  Loading fee details...

                </div>

              ) : (

                <>

                  {/* =============================================
                      FEE SUMMARY
                  ============================================= */}

                  {feeSummary && (

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                      <div className="bg-white border rounded-xl p-5">

                        <p className="text-sm text-gray-500">
                          Total Fee
                        </p>

                        <p className="text-2xl font-bold text-gray-800 mt-1">
                          {
                            currency(
                              feeSummary.totalFee
                            )
                          }
                        </p>

                      </div>

                      <div className="bg-white border rounded-xl p-5">

                        <p className="text-sm text-gray-500">
                          Total Paid
                        </p>

                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {
                            currency(
                              feeSummary.totalPaid
                            )
                          }
                        </p>

                      </div>

                      <div className="bg-white border rounded-xl p-5">

                        <p className="text-sm text-gray-500">
                          Balance
                        </p>

                        <p className="text-2xl font-bold text-red-600 mt-1">
                          {
                            currency(
                              feeSummary.balance
                            )
                          }
                        </p>

                      </div>

                    </div>

                  )}

                  {/* =============================================
                      MONTHLY FEES
                  ============================================= */}

                  {feeType ===
                    "monthly" &&
                    feeStructure?.monthlyFees && (

                      <div className="bg-white border rounded-xl p-5">

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">

                          <div>

                            <h3 className="text-lg font-semibold text-gray-800">
                              Monthly Fees
                            </h3>

                            <p className="text-sm text-gray-500">
                              Select a month to make payment
                            </p>

                          </div>

                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm w-fit">
                            Monthly
                          </span>

                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

                          {feeStructure.monthlyFees.map(
                            (
                              month,
                              index
                            ) => {

                              const isSelected =
                                selectedFee?.type ===
                                  "monthly" &&
                                selectedFee?.reference ===
                                  month.month;

                              return (

                                <button
                                  key={
                                    month._id ||
                                    index
                                  }
                                  type="button"
                                  onClick={() =>
                                    selectMonth(
                                      month
                                    )
                                  }
                                  disabled={
                                    Number(
                                      month.balance ||
                                      0
                                    ) <= 0
                                  }
                                  className={`text-left border rounded-lg p-3 transition ${
                                    isSelected
                                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                                      : "hover:border-blue-400"
                                  } ${
                                    Number(
                                      month.balance ||
                                      0
                                    ) <= 0
                                      ? "opacity-70"
                                      : ""
                                  }`}
                                >

                                  <div className="flex justify-between items-start gap-2">

                                    <span className="font-semibold text-gray-800">
                                      {
                                        month.month
                                      }
                                    </span>

                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${statusClass(
                                        month.status
                                      )}`}
                                    >
                                      {
                                        month.status ||
                                        "Pending"
                                      }
                                    </span>

                                  </div>

                                  <div className="mt-3 text-sm">

                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Fee
                                      </span>

                                      <span>
                                        {
                                          currency(
                                            month.amount
                                          )
                                        }
                                      </span>
                                    </div>

                                    <div className="flex justify-between mt-1">
                                      <span className="text-gray-500">
                                        Paid
                                      </span>

                                      <span className="text-green-600">
                                        {
                                          currency(
                                            month.paid
                                          )
                                        }
                                      </span>
                                    </div>

                                    <div className="flex justify-between mt-1 font-semibold">
                                      <span>
                                        Balance
                                      </span>

                                      <span className="text-red-600">
                                        {
                                          currency(
                                            month.balance
                                          )
                                        }
                                      </span>
                                    </div>

                                  </div>

                                </button>
                              );
                            }
                          )}

                        </div>

                      </div>
                    )}

                  {/* =============================================
                      INSTALLMENTS
                  ============================================= */}

                  {feeType ===
                    "installment" &&
                    feeStructure?.installments && (

                      <div className="bg-white border rounded-xl p-5">

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">

                          <div>

                            <h3 className="text-lg font-semibold text-gray-800">
                              Installments
                            </h3>

                            <p className="text-sm text-gray-500">
                              Select an installment to make payment
                            </p>

                          </div>

                          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm w-fit">
                            3 Installments
                          </span>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                          {feeStructure.installments.map(
                            (
                              installment,
                              index
                            ) => {

                              const isSelected =
                                selectedFee?.type ===
                                  "installment" &&
                                String(
                                  selectedFee?.reference
                                ) ===
                                  String(
                                    installment.installmentNumber
                                  );

                              return (

                                <button
                                  key={
                                    installment._id ||
                                    index
                                  }
                                  type="button"
                                  onClick={() =>
                                    selectInstallment(
                                      installment
                                    )
                                  }
                                  disabled={
                                    Number(
                                      installment.balance ||
                                      0
                                    ) <= 0
                                  }
                                  className={`text-left border rounded-xl p-4 transition ${
                                    isSelected
                                      ? "border-purple-600 bg-purple-50 ring-2 ring-purple-200"
                                      : "hover:border-purple-400"
                                  }`}
                                >

                                  <div className="flex justify-between items-start gap-2">

                                    <div>

                                      <p className="text-sm text-gray-500">
                                        Installment{" "}
                                        {
                                          installment.installmentNumber
                                        }
                                      </p>

                                      <h4 className="font-semibold text-gray-800">
                                        {
                                          installment.title ||
                                          `Installment ${installment.installmentNumber}`
                                        }
                                      </h4>

                                    </div>

                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${statusClass(
                                        installment.status
                                      )}`}
                                    >
                                      {
                                        installment.status ||
                                        "Pending"
                                      }
                                    </span>

                                  </div>

                                  <div className="mt-4 space-y-1 text-sm">

                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Amount
                                      </span>

                                      <span>
                                        {
                                          currency(
                                            installment.amount
                                          )
                                        }
                                      </span>
                                    </div>

                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Paid
                                      </span>

                                      <span className="text-green-600">
                                        {
                                          currency(
                                            installment.paid
                                          )
                                        }
                                      </span>
                                    </div>

                                    <div className="flex justify-between font-semibold">
                                      <span>
                                        Balance
                                      </span>

                                      <span className="text-red-600">
                                        {
                                          currency(
                                            installment.balance
                                          )
                                        }
                                      </span>
                                    </div>

                                  </div>

                                </button>
                              );
                            }
                          )}

                        </div>

                      </div>
                    )}

                  {/* =============================================
                      CUSTOM FEE
                  ============================================= */}

                  {feeType ===
                    "custom" && (

                      <div className="bg-white border rounded-xl p-5">

                        <h3 className="text-lg font-semibold text-gray-800">
                          Custom Fee
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Enter the amount to record a payment.
                        </p>

                      </div>
                    )}

                  {/* =============================================
                      PAYMENT FORM
                  ============================================= */}

                  {feeSummary &&
                    Number(
                      feeSummary.balance
                    ) > 0 && (

                      <div className="bg-white border rounded-xl p-5">

                        <div className="mb-5">

                          <h3 className="text-lg font-semibold text-gray-800">
                            Make Payment
                          </h3>

                          {selectedFee ? (

                            <div className="mt-3 p-4 bg-gray-50 rounded-lg">

                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

                                <div>

                                  <p className="text-sm text-gray-500">
                                    Selected Fee
                                  </p>

                                  <p className="font-semibold text-gray-800">
                                    {
                                      selectedFee.label
                                    }
                                  </p>

                                </div>

                                <div className="text-left sm:text-right">

                                  <p className="text-sm text-gray-500">
                                    Balance
                                  </p>

                                  <p className="text-lg font-bold text-red-600">
                                    {
                                      currency(
                                        selectedFee.balance
                                      )
                                    }
                                  </p>

                                </div>

                              </div>

                            </div>

                          ) : (

                            <p className="text-sm text-gray-500 mt-1">

                              {feeType ===
                              "monthly"
                                ? "Select a month above."
                                : feeType ===
                                  "installment"
                                ? "Select an installment above."
                                : "Enter the payment amount."}

                            </p>
                          )}

                        </div>

                        <form
                          onSubmit={
                            handlePayment
                          }
                        >

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* AMOUNT */}

                            <div>

                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Amount
                              </label>

                              <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={
                                  amount
                                }
                                onChange={
                                  handleAmountChange
                                }
                                placeholder="Enter amount"
                                disabled={
                                  (
                                    feeType ===
                                      "monthly" ||
                                    feeType ===
                                      "installment"
                                  ) &&
                                  !selectedFee
                                }
                                className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              />

                              {selectedFee && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Maximum:
                                  {" "}
                                  {
                                    currency(
                                      selectedFee.balance
                                    )
                                  }
                                </p>
                              )}

                            </div>

                            {/* PAYMENT METHOD */}

                            <div>

                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Method
                              </label>

                              <select
                                value={
                                  paymentMethod
                                }
                                onChange={(e) =>
                                  setPaymentMethod(
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
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

                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Date
                              </label>

                              <input
                                type="date"
                                value={
                                  paymentDate
                                }
                                onChange={(e) =>
                                  setPaymentDate(
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              />

                            </div>

                            {/* REMARKS */}

                            <div>

                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks
                              </label>

                              <input
                                type="text"
                                value={
                                  remarks
                                }
                                onChange={(e) =>
                                  setRemarks(
                                    e.target.value
                                  )
                                }
                                placeholder="Optional"
                                className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              />

                            </div>

                          </div>

                          {/* SUBMIT */}

                          <div className="mt-5">

                            <button
                              type="submit"
                              disabled={
                                submitting ||
                                (
                                  (
                                    feeType ===
                                      "monthly" ||
                                    feeType ===
                                      "installment"
                                  ) &&
                                  !selectedFee
                                ) ||
                                !amount
                              }
                              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                            >

                              {submitting
                                ? "Processing..."
                                : "Add Payment"}

                            </button>

                          </div>

                        </form>

                      </div>
                    )}

                  {/* =============================================
                      FULLY PAID
                  ============================================= */}

                  {feeSummary &&
                    Number(
                      feeSummary.balance
                    ) <= 0 && (

                      <div className="bg-green-50 border border-green-200 rounded-xl p-5">

                        <div className="flex items-center gap-3">

                          <div className="text-2xl">
                            ✓
                          </div>

                          <div>

                            <h3 className="font-semibold text-green-800">
                              Fee Fully Paid
                            </h3>

                            <p className="text-sm text-green-700">
                              This student's current fee balance is ₹0.
                            </p>

                          </div>

                        </div>

                      </div>
                    )}

                </>
              )}

            </>
          )}

        </div>

      </div>

      {/* =====================================================
          PAYMENT HISTORY
      ===================================================== */}

      <div className="mt-8 bg-white border rounded-xl shadow-sm">

        <div className="p-5 border-b">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            <div>

              <h2 className="text-lg font-semibold text-gray-800">
                Payment History
              </h2>

              <p className="text-sm text-gray-500">
                All student payments
              </p>

            </div>

            <div className="text-sm text-gray-500">
              {
                payments.length
              } payments
            </div>

          </div>

        </div>

        <div className="overflow-x-auto">

          {loadingPayments ? (

            <div className="p-8 text-center text-gray-500">
              Loading payments...
            </div>

          ) : payments.length ===
            0 ? (

            <div className="p-8 text-center text-gray-500">
              No payments found
            </div>

          ) : (

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-4 py-3">
                    Date
                  </th>

                  <th className="text-left px-4 py-3">
                    Student
                  </th>

                  <th className="text-left px-4 py-3">
                    Fee
                  </th>

                  <th className="text-left px-4 py-3">
                    Amount
                  </th>

                  <th className="text-left px-4 py-3">
                    Method
                  </th>

                  <th className="text-left px-4 py-3">
                    Receipt
                  </th>

                  <th className="text-right px-4 py-3">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {payments.map(
                  (payment) => (

                    <tr
                      key={
                        payment._id
                      }
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="px-4 py-3 whitespace-nowrap">
                        {
                          formatDate(
                            payment.paymentDate
                          )
                        }
                      </td>

                      <td className="px-4 py-3">

                        <p className="font-medium text-gray-800">
                          {
                            payment
                              .studentId
                              ?.name ||
                            "-"
                          }
                        </p>

                        <p className="text-xs text-gray-500">
                          {
                            payment
                              .studentId
                              ?.studentId ||
                            "-"
                          }
                        </p>

                      </td>

                      <td className="px-4 py-3">

                        {payment.feeType ===
                        "monthly" ? (

                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                            {
                              payment.feeReference ||
                              "Monthly"
                            }
                          </span>

                        ) : payment.feeType ===
                          "installment" ? (

                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">
                            Installment{" "}
                            {
                              payment.feeReference
                            }
                          </span>

                        ) : (

                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                            Custom
                          </span>

                        )}

                      </td>

                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {
                          currency(
                            payment.amount
                          )
                        }
                      </td>

                      <td className="px-4 py-3">

                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                          {
                            payment.paymentMethod
                          }
                        </span>

                      </td>

                      <td className="px-4 py-3 font-mono text-xs">
                        {
                          payment.receiptNumber
                        }
                      </td>

                      <td className="px-4 py-3 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            deletePayment(
                              payment._id
                            )
                          }
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}

        </div>

      </div>

    </div>
  );
};

export default PaymentDashboard;