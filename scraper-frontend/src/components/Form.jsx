import { useState } from "react";
import Loading from "./Loading";

export default function Form() {
  const [formData, setFormData] = useState({
    companyname: "",
    source: "Capterra",
    startDate: "",
    endDate: "",
  });

  const [popup, setPopup] = useState({
    show: false,
    status: "loading",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPopup({
      show: true,
      status: "loading",
      message: "Please wait while scraping  is done",
    });

    try {
      const res = await fetch("/api/scrape-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Scraping failed");
      }

      setPopup({
        show: true,
        status: "success",
        message: `Fetched ${data.totalReviews} reviews successfully.`,
      });

      const fileRes = await fetch("/output");
      const blob = await fileRes.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reviews.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setPopup({
        show: true,
        status: "error",
        message: err.message || "Something went wrong",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6 text-center text-neutral-800">
        Scrape Reviews
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="companyname"
            placeholder="e.g. Slack, Notion"
            value={formData.companyname}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Source
          </label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="Capterra">Capterra</option>
            <option value="Trustradius">Trustradius</option>
            <option value="G2">G2(Login Credentials Required)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-md border cursor-pointer border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full rounded-md border cursor-pointer border-neutral-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-neutral-900 text-white py-2 rounded-md font-medium hover:bg-neutral-800 transition cursor-pointer"
        >
          Scrape Reviews
        </button>
      </form>
      <Loading
        show={popup.show}
        status={popup.status}
        message={popup.message}
        onClose={() =>
          setPopup({ show: false, status: "loading", message: "" })
        }
      />
    </div>
  );
}
