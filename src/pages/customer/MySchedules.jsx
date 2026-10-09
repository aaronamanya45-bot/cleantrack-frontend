import { useEffect, useState } from "react";
import { scheduleService } from "../../services/scheduleService";
import { locationService } from "../../services/locationService";
import { categoryService } from "../../services/categoryService";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const MySchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    location_id: "",
    waste_category_id: "",
    day_of_week: "monday",
    estimated_bin_level: 50,
    note: ""
  });

  // Load schedules + locations + categories in parallel on first render.
  useEffect(() => {
    Promise.all([
      scheduleService.mySchedules(),
      locationService.myLocations(),
      categoryService.list()
    ])
      .then(([schedulesRes, locationsRes, categoriesRes]) => {
        setSchedules(schedulesRes.data);
        setLocations(locationsRes.data);
        setCategories(categoriesRes.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not load data");
      })
      .finally(() => setLoading(false));
  }, []);

  const onChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation before hitting the API.
    if (!form.location_id || !form.waste_category_id) {
      setError("Please select a location and waste type");
      return;
    }
    const level = Number(form.estimated_bin_level);
    if (Number.isNaN(level) || level < 1 || level > 100) {
      setError("Bin level must be between 1 and 100");
      return;
    }

    setSaving(true);
    try {
      const response = await scheduleService.create({
        ...form,
        location_id: Number(form.location_id),
        waste_category_id: Number(form.waste_category_id),
        estimated_bin_level: level
      });

      // Reload list so the new schedule appears with joined fields.
      const refreshed = await scheduleService.mySchedules();
      setSchedules(refreshed.data);
      setSuccess(response.data.message || "Schedule created");

      setForm({
        location_id: "",
        waste_category_id: "",
        day_of_week: "monday",
        estimated_bin_level: 50,
        note: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not create schedule");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = async (id) => {
    if (!window.confirm("Cancel this schedule?")) return;
    setError("");
    setSuccess("");
    try {
      await scheduleService.cancel(id);
      setSchedules(schedules.filter((s) => s.id !== id));
      setSuccess("Schedule cancelled");
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel schedule");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3">My Recurring Pickup Schedules</h1>
      <p className="text-muted">
        Set a weekly pickup. Your admin will approve it, and pickups will be generated automatically on the chosen day.
      </p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      {/* ---------- Create form ---------- */}
      <div className="content-card mb-4">
        <h2 className="h5 mb-3">New Schedule</h2>
        <form onSubmit={onSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Location</label>
            <select
              className="form-select"
              name="location_id"
              value={form.location_id}
              onChange={onChange}
            >
              <option value="">Select a location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.location_name} — {loc.district}
                </option>
              ))}
            </select>
            {!locations.length && (
              <small className="text-danger">Add a location first.</small>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Waste Type</label>
            <select
              className="form-select"
              name="waste_category_id"
              value={form.waste_category_id}
              onChange={onChange}
            >
              <option value="">Select waste type</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Pickup Day</label>
            <select
              className="form-select"
              name="day_of_week"
              value={form.day_of_week}
              onChange={onChange}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Estimated Bin Level (1–100)</label>
            <input
              type="number"
              min="1"
              max="100"
              className="form-control"
              name="estimated_bin_level"
              value={form.estimated_bin_level}
              onChange={onChange}
            />
          </div>

          <div className="col-md-8">
            <label className="form-label">Note (optional)</label>
            <input
              type="text"
              className="form-control"
              name="note"
              value={form.note}
              onChange={onChange}
              placeholder="e.g. Gate is on the left"
            />
          </div>

          <div className="col-12">
            <button
              type="submit"
              className="btn btn-cleantrack"
              disabled={saving || !locations.length}
            >
              {saving ? "Saving..." : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>

      {/* ---------- List ---------- */}
      <div className="content-card">
        <h2 className="h5 mb-3">My Schedules</h2>
        {!schedules.length ? (
          <p className="text-muted mb-0">You have no schedules yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Location</th>
                  <th>Waste</th>
                  <th>Bin Level</th>
                  <th>Status</th>
                  <th>Admin Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td className="text-capitalize">{s.day_of_week}</td>
                    <td>{s.location_name}<br /><small className="text-muted">{s.district}</small></td>
                    <td>{s.waste_type}</td>
                    <td>{s.estimated_bin_level}%</td>
                    <td>
                      <span className={`badge ${
                        s.status === "approved" ? "text-bg-success" :
                        s.status === "rejected" ? "text-bg-danger" :
                        "text-bg-warning"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td><small>{s.admin_note || "—"}</small></td>
                    <td>
                      {s.status === "pending" && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onCancel(s.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default MySchedules;