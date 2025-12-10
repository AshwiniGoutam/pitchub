"use client";

import { useState } from "react";

export default function LeadForm({ params }) {
    const { investorId } = params;
    const [formData, setFormData] = useState({
        startupName: "",
        founderName: "",
        sector: "",
        stage: "",
        minInvestment: "",
        maxInvestment: "",
        email: "",
        location: "",
        description: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ investorId, ...formData }),
        });

        if (res.ok) {
            setSubmitted(true);
        } else {
            alert("Failed to submit");
        }
    };

    if (submitted)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-emerald-50 to-white p-8">
                <div className="bg-white rounded-xl shadow-lg p-10 text-center max-w-md w-full">
                    <h2 className="text-3xl font-bold mb-4 text-emerald-700">Thank You!</h2>
                    <p className="text-gray-600">Your startup information has been submitted successfully.</p>
                </div>
            </div>
        );

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-emerald-50 to-white p-6">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full">
                <h2 className="text-3xl font-bold mb-6 text-emerald-700 text-center">
                    Submit Your Startup
                </h2>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Startup Name</label>
                        <input
                            type="text"
                            placeholder="Enter startup name"
                            value={formData.startupName}
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, startupName: e.target.value })
                            }
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Founder Name</label>
                        <input
                            type="text"
                            placeholder="Enter founder name"
                            value={formData.founderName}
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, founderName: e.target.value })
                            }
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Sector</label>
                        <select
                            value={formData.sector}
                            required
                            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        >
                            <option value="" disabled>
                                Select your startup sector
                            </option>
                            <option value="Fintech">Fintech</option>
                            <option value="HealthTech">HealthTech</option>
                            <option value="EdTech">EdTech</option>
                            <option value="AI/ML">AI/ML</option>
                            <option value="SaaS">SaaS</option>
                            <option value="E-commerce">E-commerce</option>
                            <option value="CleanTech">CleanTech</option>
                            <option value="AgriTech">AgriTech</option>
                            <option value="Cybersecurity">Cybersecurity</option>
                            <option value="Blockchain">Blockchain</option>
                        </select>
                    </div>

                    {/* <div>
                        <label className="block mb-1 font-medium text-gray-700">Stage</label>
                        <input
                            type="text"
                            placeholder="Enter startup stage"
                            value={formData.stage}
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, stage: e.target.value })
                            }
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                    </div> */}

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Sector</label>
                        <select
                            value={formData.stage}
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, stage: e.target.value })
                            }
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        >
                            <option value="" disabled>
                                Select your startup sector
                            </option>
                            <option value="Pre-Seed">Pre-Seed</option>
                            <option value="Pre-Sector A">Pre-Sector A</option>
                            <option value="Seed">Seed</option>
                            <option value="Series A">Series A</option>
                            <option value="Series B">Series B</option>
                            <option value="Series C">Series C +</option>
                        </select>
                    </div>

                    <div class="flex flex-col gap-4 sm:flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Minimum Amount</label>
                            <input
                                type="number"
                                placeholder="Enter minimum investment amount"
                                value={formData.minInvestment}
                                required
                                onChange={(e) =>
                                    setFormData({ ...formData, minInvestment: e.target.value })
                                }
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Maximum Amount</label>
                            <input
                                type="number"
                                placeholder="Enter maximum investment amount"
                                value={formData.maxInvestment}
                                required
                                onChange={(e) =>
                                    setFormData({ ...formData, maxInvestment: e.target.value })
                                }
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={formData.email}
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            placeholder="Enter location"
                            value={formData.location}
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, location: e.target.value })
                            }
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Description</label>
                        <textarea
                            rows={4}
                            placeholder="Brief description about your startup"
                            value={formData.description}
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-emerald-700 transition"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
