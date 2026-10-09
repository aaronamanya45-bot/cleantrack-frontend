import api from "./api";

export const scheduleService = {
  // Customer
  create: (payload) => api.post("/schedules", payload),
  mySchedules: () => api.get("/schedules/my-schedules"),
  cancel: (id) => api.delete(`/schedules/${id}`),

  // Admin
  listByStatus: (status = "pending") =>
    api.get(`/schedules/admin/list?status=${status}`),
  updateStatus: (id, status, admin_note = "") =>
    api.put(`/schedules/admin/${id}/status`, { status, admin_note }),
  generatePickups: () => api.post("/schedules/admin/generate-pickups")
};