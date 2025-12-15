"use client";

import { Upload } from "lucide-react";
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
        competitorsData: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [pitchDeck, setPitchDeck] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fd = new FormData(); // renamed to avoid conflict

        // append route param
        fd.append("investorId", investorId);

        // append all form fields
        Object.entries(formData).forEach(([key, value]) => {
            fd.append(key, value);
        });

        // append file
        if (pitchDeck) {
            fd.append("pitchDeck", pitchDeck);
        }

        // DEBUG (optional)
        for (let pair of fd.entries()) {
            console.log(pair[0], pair[1]);
        }

        const res = await fetch("/api/lead", {
            method: "POST",
            body: fd, // ❗ NO headers
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
                        <label className="block mb-1 font-medium text-gray-700">Stage</label>
                        <select
                            value={formData.stage}
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, stage: e.target.value })
                            }
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        >
                            <option value="" disabled>
                                Select your startup Stage
                            </option>
                            <option value="Pre-Seed">Pre-Seed</option>
                            <option value="Pre-Seed A">Pre-Seed A</option>
                            <option value="Seed">Seed</option>
                            <option value="Series A">Series A</option>
                            <option value="Series B">Series B</option>
                            <option value="Series C">Series C +</option>
                        </select>
                    </div>

                    <div class="flex flex-col gap-4 sm:flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Minimum Funding Amount ($/inr)</label>
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
                            <label className="block mb-1 font-medium text-gray-700">Maximum Funding Amount ($/inr)</label>
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
                        <label className="block mb-1 font-medium text-gray-700">Who are competitors?  what do you understand about your business that they don't</label>
                        <textarea
                            rows={4}
                            placeholder="Brief about your startup"
                            value={formData.competitorsData}
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, competitorsData: e.target.value })
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

                    <div className="space-y-2 mt-6">
                        <label className="block mb-1 font-medium text-gray-700">
                            Pitch Deck (PDF, PPT, PPTX – max 10MB)
                        </label>
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition"
                            onClick={() =>
                                document.getElementById("pitchDeck")?.click()
                            }
                        >
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                {pitchDeck
                                    ? pitchDeck.name
                                    : "Click to upload or drag and drop"}
                            </p>
                            <input
                                id="pitchDeck"
                                type="file"
                                accept=".pdf,.ppt,.pptx"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setPitchDeck(file);
                                }}
                            />
                            {pitchDeck && (
                                <p className="text-xs text-green-600 mt-2">
                                    ✅ {pitchDeck.name} selected
                                </p>
                            )}
                        </div>
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
