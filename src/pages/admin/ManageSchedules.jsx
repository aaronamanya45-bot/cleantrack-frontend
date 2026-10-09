import { useEffect, useState } from "react";
import { scheduleService } from "../../services/scheduleService";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const STATUSES = ["pending", "approved", "rejected"];

const ManageSchedules = () => {
  const [status, setStatus] = useState("pending");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = (currentStatus = status) => {
    setLoading(true);
    setError("");
    scheduleService
      .listByStatus(currentStatus)
      .then((response) => setSchedules(response.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load schedules"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const review = async (id, newStatus) => {
    const adminNote = newStatus === "rejected"
      ? window.prompt("Reason for rejection (optional):") || ""
      : "";

    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await scheduleService.updateStatus(id, newStatus, adminNote);
      setSchedules(schedules.filter((s) => s.id !== id));
      setSuccess(`Schedule ${newStatus}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update schedule");
    } finally {
      setBusyId(null);
    }
  };

  const generate = async () => {
    if (!window.confirm("Generate pickup requests for every approved schedule that matches today?")) return;
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      const res = await scheduleService.generatePickups();
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate pickups");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h1 className="h3 mb-0">Schedule Approvals</h1>
        <button className="btn btn-cleantrack" onClick={generate} disabled={generating}>
          {generating ? "Generating..." : "Generate This Week's Pickups"}
        </button>
      </div>

      <p className="text-muted">
        Approve or reject customer recurring schedules. Approving a schedule allows pickups
        to be auto-generated on its day.
      </p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      {/* Status filter tabs */}
      <ul className="nav nav-pills mb-3 gap-2">
        {STATUSES.map((s) => (
          <li className="nav-item" key={s}>
            <button
              className={`nav-link text-capitalize ${status === s ? "active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>

      {loading ? (
        <LoadingSpinner />
      ) : !schedules.length ? (
        <div className="content-card">
          <p className="text-muted mb-0">No {status} schedules.</p>
        </div>
      ) : (
        <div className="content-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Day</th>
                  <th>Location</th>
                  <th>Waste</th>
                  <th>Bin Level</th>
                  <th>Note</th>
                  {status === "pending" && <th></th>}
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.customer_name}
                      <br />
                      <small className="text-muted">{s.customer_email}</small>
                    </td>
                    <td className="text-capitalize">{s.day_of_week}</td>
                    <td>{s.location_name}<br /><small className="text-muted">{s.district}</small></td>
                    <td>{s.waste_type}</td>
                    <td>{s.estimated_bin_level}%</td>
                    <td><small>{s.note || "—"}</small></td>
                    {status === "pending" && (
                      <td className="text-nowrap">
                        <button
                          className="btn btn-sm btn-success me-1"
                          disabled={busyId === s.id}
                          onClick={() => review(s.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={busyId === s.id}
                          onClick={() => review(s.id, "rejected")}
                        >
                          Reject
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageSchedules;