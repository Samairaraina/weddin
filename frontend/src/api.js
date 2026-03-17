import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "";
const api = axios.create({ baseURL: BASE });

export const estimateBudget = (data) => api.post("/api/budget/estimate", data);
export const getBudgetById = (id) => api.get(`/api/budget/estimate/${id}`);
export const getNarrative = (id) => api.post(`/api/budget/narrative/${id}`);
export const downloadPDF = (id) => api.get(`/api/budget/pdf/${id}`, { responseType: "blob" });
export const getDecorLibrary = (params) => api.get("/api/decor/library", { params });
export const scrapeDecor = (functionType) => api.post(`/api/decor/scrape/${functionType}`);
export const labelDecor = (id, data) => api.patch(`/api/decor/label/${id}`, data);
export const predictDecorCost = (id) => api.post(`/api/decor/predict/${id}`);
export const getArtists = (params) => api.get("/api/artists", { params });
export const getLogistics = (params) => api.get("/api/logistics/estimate", { params });
export const getAdminArtists = () => api.get("/api/admin/artists");
export const updateArtist = (id, data) => api.patch(`/api/admin/artist/${id}`, data);
export const getAdminFBRates = () => api.get("/api/admin/fb-rates");
export const updateFBRate = (id, data) => api.patch(`/api/admin/fb-rates/${id}`, data);
export const getAdminLogistics = () => api.get("/api/admin/logistics");
export const updateLogisticsRule = (id, data) => api.patch(`/api/admin/logistics/${id}`, data);
export const getAdminDecor = () => api.get("/api/admin/decor");
export const trainDecorModel = () => api.post("/api/admin/train");
export const createRSVPEvent = (data) => api.post("/api/rsvp/event", data);
export const submitRSVP = (data) => api.post("/api/rsvp/respond", data);

export default api;
