import { useEffect, useState } from "react";
import { Edit, Trash2, MapPin, Plus, X } from "lucide-react";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../services/addressService";

import LoadingSpinner from "../components/LoadingSpinner";
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
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --------------------------------------------------
  // LOAD ADDRESSES
  // --------------------------------------------------

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

      setError(
        apiError(
          e,
          "Could not load your addresses."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // --------------------------------------------------
  // INPUT CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --------------------------------------------------
  // OPEN ADD FORM
  // --------------------------------------------------

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  // --------------------------------------------------
  // OPEN EDIT FORM
  // --------------------------------------------------

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

  // --------------------------------------------------
  // CLOSE FORM
  // --------------------------------------------------

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // --------------------------------------------------
  // SAVE ADDRESS
  // --------------------------------------------------

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
      } else {
        await createAddress(payload);
      }

      closeForm();
      await loadAddresses();

    } catch (e) {
      console.error("ADDRESS SAVE ERROR:", e);

      setError(
        apiError(
          e,
          "Could not save the address."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE ADDRESS
  // --------------------------------------------------

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      await deleteAddress(addressId);
      await loadAddresses();
    } catch (e) {
      console.error("ADDRESS DELETE ERROR:", e);

      alert(
        apiError(
          e,
          "Could not delete the address."
        )
      );
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="container-page py-10">
        <LoadingSpinner />
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="container-page py-10">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm font-bold text-brand-600">
            DELIVERY
          </p>

          <h1 className="mt-1 text-3xl font-black">
            My Addresses
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your delivery addresses.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add address
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ADDRESS LIST */}

      {addresses.length === 0 ? (
        <div className="card mt-8 p-10 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <MapPin size={30} />
          </div>

          <h2 className="mt-5 text-xl font-black">
            No addresses yet
          </h2>

          <p className="mt-2 text-slate-500">
            Add your delivery address to continue with checkout.
          </p>

          <button
            onClick={openAddForm}
            className="btn-primary mt-5 inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Add your first address
          </button>

        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">

          {addresses.map((address) => (
            <div
              key={address.address_id}
              className="card p-5"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="font-black">
                        {address.address_type || "Address"}
                      </h2>

                      {address.is_default && (
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                          Default
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {address.recipient_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {address.recipient_phone}
                    </p>
                  </div>

                </div>

              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">

                <p>
                  {address.house_no}, {address.street}
                </p>

                <p>
                  {address.city}, {address.state} - {address.pincode}
                </p>

                {address.landmark && (
                  <p>
                    Landmark: {address.landmark}
                  </p>
                )}

              </div>

              <div className="mt-4 flex gap-4">

                <button
                  onClick={() => openEditForm(address)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(address.address_id)
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:underline"
                >
                  <Trash2 size={16} />
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ADD / EDIT FORM */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* FORM HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>
                <h2 className="text-xl font-black">
                  {editingId
                    ? "Edit address"
                    : "Add new address"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your delivery details.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-5"
            >

              <div className="grid gap-4 sm:grid-cols-2">

                {/* NAME */}

                <div>
                  <label className="text-sm font-semibold">
                    Recipient name
                  </label>

                  <input
                    name="recipient_name"
                    value={form.recipient_name}
                    onChange={handleChange}
                    className="input mt-1"
                    placeholder="Your name"
                    required
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="text-sm font-semibold">
                    Phone number
                  </label>

                  <input
                    name="recipient_phone"
                    value={form.recipient_phone}
                    onChange={handleChange}
                    className="input mt-1"
                    placeholder="9876543210"
                    required
                  />
                </div>

                {/* HOUSE */}

                <div>
                  <label className="text-sm font-semibold">
                    House / Flat number
                  </label>

                  <input
                    name="house_no"
                    value={form.house_no}
                    onChange={handleChange}
                    className="input mt-1"
                    placeholder="House No. / Flat No."
                    required
                  />
                </div>

                {/* STREET */}

                <div>
                  <label className="text-sm font-semibold">
                    Street / Area
                  </label>

                  <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    className="input mt-1"
                    placeholder="Street or locality"
                    required
                  />
                </div>

                {/* CITY */}

                <div>
                  <label className="text-sm font-semibold">
                    City
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="input mt-1"
                    placeholder="City"
                    required
                  />
                </div>

                {/* STATE */}

                <div>
                  <label className="text-sm font-semibold">
                    State
                  </label>

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="input mt-1"
                    placeholder="State"
                    required
                  />
                </div>

                {/* PINCODE */}

                <div>
                  <label className="text-sm font-semibold">
                    Pincode
                  </label>

                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className="input mt-1"
                    placeholder="456001"
                    maxLength={10}
                    required
                  />
                </div>

                {/* ADDRESS TYPE */}

                <div>
                  <label className="text-sm font-semibold">
                    Address type
                  </label>

                  <select
                    name="address_type"
                    value={form.address_type}
                    onChange={handleChange}
                    className="input mt-1"
                  >
                    <option value="Home">
                      Home
                    </option>

                    <option value="Work">
                      Work
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

              </div>

              {/* LANDMARK */}

              <div className="mt-4">

                <label className="text-sm font-semibold">
                  Landmark
                  <span className="font-normal text-slate-400">
                    {" "}optional
                  </span>
                </label>

                <input
                  name="landmark"
                  value={form.landmark}
                  onChange={handleChange}
                  className="input mt-1"
                  placeholder="Near school, temple, mall..."
                />

              </div>

              {/* DEFAULT */}

              <label className="mt-4 flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  name="is_default"
                  checked={form.is_default}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <span className="text-sm font-semibold">
                  Make this my default address
                </span>

              </label>

              {/* ACTIONS */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeForm}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update address"
                    : "Save address"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}