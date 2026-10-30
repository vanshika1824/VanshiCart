import { useEffect, useState } from "react";
import { Edit2, Trash2, MapPin, Plus, X, CheckCircle2, Home, Briefcase, Navigation } from "lucide-react";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../services/addressService";

import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { apiError } from "../services/api";

const emptyForm = {
  recipient_name: "",
  recipient_phone: "",
  house_no: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  address_type: "Home",
  is_default: false,
};

export default function Addresses() {
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAddresses();
      const data = Array.isArray(response?.data)
        ? response.data
        : response?.data?.items || [];

      setAddresses(data);
    } catch (e) {
      console.error("ADDRESS LOAD ERROR:", e);
      setError(apiError(e, "Could not load your addresses."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (address) => {
    setForm({
      recipient_name: address.recipient_name || "",
      recipient_phone: address.recipient_phone || "",
      house_no: address.house_no || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      landmark: address.landmark || "",
      address_type: address.address_type || "Home",
      is_default: Boolean(address.is_default),
    });

    setEditingId(address.address_id);
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        recipient_name: form.recipient_name.trim(),
        recipient_phone: form.recipient_phone.trim(),
        house_no: form.house_no.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        landmark: form.landmark.trim() || null,
        address_type: form.address_type || "Home",
        is_default: Boolean(form.is_default),
      };

      if (editingId) {
        await updateAddress(editingId, payload);
        toast.success("Address updated successfully!");
      } else {
        await createAddress(payload);
        toast.success("New address added successfully!");
      }

      closeForm();
      await loadAddresses();
    } catch (e) {
      console.error("ADDRESS SAVE ERROR:", e);
      setError(apiError(e, "Could not save the address."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to remove this address?")) return;

    try {
      await deleteAddress(addressId);
      toast.info("Address deleted.");
      await loadAddresses();
    } catch (e) {
      console.error("ADDRESS DELETE ERROR:", e);
      toast.error(apiError(e, "Could not delete the address."));
    }
  };

  if (loading) {
    return (
      <div className="container-page py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
            <MapPin size={13} />
            <span>Locations</span>
          </div>
          <h1 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
            Saved Delivery Addresses
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage your home, apartment, and office locations for swift checkout.
          </p>
        </div>

        <button onClick={openAddForm} className="btn-primary">
          <Plus size={18} />
          <span>Add New Address</span>
        </button>
      </div>

      {error && !showForm && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      {/* ADDRESS CARDS GRID */}
      {addresses.length === 0 ? (
        <div className="card mt-8 p-12 text-center max-w-lg mx-auto shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <MapPin size={32} />
          </div>
          <h2 className="mt-5 text-xl font-black text-slate-900">
            No Saved Addresses
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            You haven't saved any addresses yet. Add one now to enjoy 1-click
            grocery checkouts!
          </p>
          <button onClick={openAddForm} className="btn-primary mt-6">
            <Plus size={17} />
            <span>Add Your First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => {
            const isHome = address.address_type === "Home";
            const isOffice = address.address_type === "Work" || address.address_type === "Office";

            return (
              <div
                key={address.address_id}
                className={`relative flex flex-col justify-between rounded-3xl border p-5 shadow-card transition-all duration-200 hover:border-slate-300 hover:shadow-card-hover ${
                  address.is_default
                    ? "border-brand-500/80 bg-brand-50/20"
                    : "border-slate-200/80 bg-white"
                }`}
              >
                <div>
                  {/* TOP BADGES */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {isHome ? (
                        <Home size={13} className="text-brand-600" />
                      ) : isOffice ? (
                        <Briefcase size={13} className="text-brand-600" />
                      ) : (
                        <Navigation size={13} className="text-brand-600" />
                      )}
                      <span>{address.address_type || "Address"}</span>
                    </span>

                    {address.is_default && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
                        <CheckCircle2 size={12} />
                        Default
                      </span>
                    )}
                  </div>

                  {/* RECIPIENT */}
                  <div className="mt-4">
                    <h3 className="text-base font-black text-slate-900">
                      {address.recipient_name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      Phone: {address.recipient_phone}
                    </p>
                  </div>

                  {/* ADDRESS LINES */}
                  <div className="mt-3 rounded-2xl bg-slate-50/80 p-3.5 text-xs leading-relaxed text-slate-600">
                    <p className="font-medium text-slate-800">
                      {address.house_no}, {address.street}
                    </p>
                    <p className="mt-0.5">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    {address.landmark && (
                      <p className="mt-1 text-slate-400">
                        Landmark: {address.landmark}
                      </p>
                    )}
                  </div>
                </div>

                {/* CARD ACTIONS */}
                <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => openEditForm(address)}
                    className="inline-flex items-center gap-1.5 font-bold text-brand-700 hover:text-brand-900"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(address.address_id)}
                    className="inline-flex items-center gap-1.5 font-semibold text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD/EDIT ADDRESS MODAL POPUP */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-dropdown">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">
                {editingId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Recipient Full Name *
                  </label>
                  <input
                    name="recipient_name"
                    value={form.recipient_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Vanshika Maru"
                    className="input mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Phone Number *
                  </label>
                  <input
                    name="recipient_phone"
                    value={form.recipient_phone}
                    onChange={handleChange}
                    required
                    placeholder="10-digit mobile"
                    className="input mt-1.5"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    House / Flat / Block No. *
                  </label>
                  <input
                    name="house_no"
                    value={form.house_no}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Flat 402, Block B"
                    className="input mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Street / Society / Area *
                  </label>
                  <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Palm Grove Society"
                    className="input mt-1.5"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    City *
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Mumbai"
                    className="input mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    State *
                  </label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Maharashtra"
                    className="input mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    PIN Code *
                  </label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 400001"
                    className="input mt-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Landmark (Optional)
                </label>
                <input
                  name="landmark"
                  value={form.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Near Metro Station"
                  className="input mt-1.5"
                />
              </div>

              {/* ADDRESS TYPE SELECTOR */}
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Address Type
                </label>
                <div className="mt-1.5 flex gap-3">
                  {["Home", "Work", "Other"].map((type) => (
                    <label
                      key={type}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                        form.address_type === type
                          ? "border-brand-600 bg-brand-50 text-brand-800"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address_type"
                        value={type}
                        checked={form.address_type === type}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* DEFAULT CHECKBOX */}
              <div className="pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={form.is_default}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Make this my primary delivery address</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
