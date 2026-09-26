import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  Loader2,
  RefreshCw
} from "lucide-react";

import { api } from "../services/api";

function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active");

  // ==========================================
  // LOAD STUDENTS
  // ==========================================

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api("/students");

      const studentList = Array.isArray(data)
        ? data
        : data.students || [];

      setStudents(studentList);

    } catch (error) {
      console.error("Load students error:", error);

      setError(
        error.message ||
        "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadStudents();
  }, []);

  // ==========================================
  // AVAILABLE CLASSES
  // ==========================================

  const classes = useMemo(() => {
    const classList = students
      .map((student) => student.standard)
      .filter(Boolean);

    return [...new Set(classList)].sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [students]);

  // ==========================================
  // AVAILABLE DIVISIONS
  // ==========================================

  const divisions = useMemo(() => {
    const divisionList = students
      .map((student) => student.division)
      .filter(Boolean);

    return [...new Set(divisionList)].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [students]);

  // ==========================================
  // FILTER STUDENTS
  // ==========================================

  const filteredStudents = useMemo(() => {

    return students.filter((student) => {

      const searchText =
        search.toLowerCase().trim();

      // ========================================
      // SEARCH
      // ========================================

      const matchesSearch =
        !searchText ||
        student.name
          ?.toLowerCase()
          .includes(searchText) ||

        student.studentId
          ?.toLowerCase()
          .includes(searchText) ||

        student.admissionNumber
          ?.toLowerCase()
          .includes(searchText) ||

        student.phone
          ?.toLowerCase()
          .includes(searchText) ||

        student.parentPhone
          ?.toLowerCase()
          .includes(searchText);

      // ========================================
      // CLASS
      // ========================================

      const matchesClass =
        classFilter === "All" ||
        String(student.standard) ===
          String(classFilter);

      // ========================================
      // DIVISION
      // ========================================

      const matchesDivision =
        divisionFilter === "All" ||
        student.division === divisionFilter;

      // ========================================
      // STATUS
      // ========================================

      const matchesStatus =
        statusFilter === "All" ||
        student.status === statusFilter;

      return (
        matchesSearch &&
        matchesClass &&
        matchesDivision &&
        matchesStatus
      );
    });

  }, [
    students,
    search,
    classFilter,
    divisionFilter,
    statusFilter
  ]);

  return (
    <div className="space-y-6">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-sm font-medium text-indigo-600">
            Students
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Student Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage students by class and division.
          </p>

        </div>


        {/* ADD STUDENT */}

        <button
          type="button"
          onClick={() =>
            navigate("/students/add")
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
        >
          <Plus size={18} />

          Add Student
        </button>

      </div>


      {/* ====================================== */}
      {/* TOOLBAR */}
      {/* ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* ================================= */}
          {/* SEARCH */}
          {/* ================================= */}

          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name, student ID, admission number or phone..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />

          </div>


          {/* ================================= */}
          {/* CLASS */}
          {/* ================================= */}

          <select
            value={classFilter}
            onChange={(e) =>
              setClassFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          >

            <option value="All">
              All Classes
            </option>

            {classes.map((studentClass) => (

              <option
                key={studentClass}
                value={studentClass}
              >
                Class {studentClass}
              </option>

            ))}

          </select>


          {/* ================================= */}
          {/* DIVISION */}
          {/* ================================= */}

          <select
            value={divisionFilter}
            onChange={(e) =>
              setDivisionFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          >

            <option value="All">
              All Divisions
            </option>

            {divisions.map((division) => (

              <option
                key={division}
                value={division}
              >
                Division {division}
              </option>

            ))}

          </select>


          {/* ================================= */}
          {/* STATUS */}
          {/* ================================= */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          >

            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Transferred">
              Transferred
            </option>

          </select>


          {/* ================================= */}
          {/* REFRESH */}
          {/* ================================= */}

          <button
            type="button"
            onClick={loadStudents}
            disabled={loading}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            title="Refresh"
          >

            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

          </button>

        </div>

      </div>


      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (

        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={loadStudents}
            className="font-semibold underline"
          >
            Retry
          </button>

        </div>

      )}


      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* =================================== */}
        {/* TABLE HEADER */}
        {/* =================================== */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">

              <Users size={20} />

            </div>


            <div>

              <h2 className="font-semibold text-slate-900">
                Students
              </h2>

              <p className="text-xs text-slate-400">

                {filteredStudents.length} student
                {filteredStudents.length !== 1
                  ? "s"
                  : ""}{" "}
                found

              </p>

            </div>

          </div>

        </div>


        {/* =================================== */}
        {/* LOADING */}
        {/* =================================== */}

        {loading ? (

          <div className="flex min-h-80 items-center justify-center">

            <div className="flex flex-col items-center gap-3 text-slate-400">

              <Loader2
                size={30}
                className="animate-spin text-indigo-600"
              />

              <p className="text-sm">
                Loading students...
              </p>

            </div>

          </div>

        ) : filteredStudents.length === 0 ? (

          /* ================================= */
          /* EMPTY */
          /* ================================= */

          <div className="flex min-h-80 flex-col items-center justify-center px-5 text-center">

            <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">

              <Users size={32} />

            </div>

            <h3 className="mt-4 font-semibold text-slate-700">
              No students found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-400">
              Try changing your search or filters,
              or add a new student.
            </p>

          </div>

        ) : (

          /* ================================= */
          /* DATA TABLE */
          /* ================================= */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs uppercase tracking-wider text-slate-400">

                  <th className="px-5 py-4 font-medium">
                    Student
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Admission No.
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Class
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Division
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Phone
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredStudents.map(
                  (student) => (

                    <tr
                      key={student._id}
                      onClick={() =>
                        navigate(
                          `/students/${student._id}`
                        )
                      }
                      className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-slate-50"
                    >

                      {/* ===================== */}
                      {/* STUDENT */}
                      {/* ===================== */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">

                            {student.name
                              ?.charAt(0)
                              ?.toUpperCase()}

                          </div>


                          <div>

                            <p className="text-sm font-semibold text-slate-800">
                              {student.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {student.studentId}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* ===================== */}
                      {/* ADMISSION NUMBER */}
                      {/* ===================== */}

                      <td className="px-5 py-4 text-sm text-slate-600">

                        {student.admissionNumber || "-"}

                      </td>


                      {/* ===================== */}
                      {/* CLASS */}
                      {/* ===================== */}

                      <td className="px-5 py-4">

                        <span className="inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-600">

                          {student.standard
                            ? `Class ${student.standard}`
                            : "-"}

                        </span>

                      </td>


                      {/* ===================== */}
                      {/* DIVISION */}
                      {/* ===================== */}

                      <td className="px-5 py-4">

                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">

                          {student.division || "-"}

                        </span>

                      </td>


                      {/* ===================== */}
                      {/* PHONE */}
                      {/* ===================== */}

                      <td className="px-5 py-4 text-sm text-slate-600">

                        {student.phone || "-"}

                      </td>


                      {/* ===================== */}
                      {/* STATUS */}
                      {/* ===================== */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            student.status ===
                            "Active"
                              ? "bg-emerald-50 text-emerald-600"
                              : student.status ===
                                "Completed"
                              ? "bg-blue-50 text-blue-600"
                              : student.status ===
                                "Transferred"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {student.status ||
                            "Active"}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Students;