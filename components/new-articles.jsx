"use client";

import { useEffect, useState } from "react";

export default function InvestmentNews() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchArticles() {
            try {
                const res = await fetch("/api/newsapi");
                const data = await res.json();
                setArticles(data);
            } catch (err) {
                console.error("Error fetching articles:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchArticles();
    }, []);

    if (loading) return <p className="p-4">Loading news...</p>;

    return (
        <div className="py-6">
            <h1 className="text-2xl font-bold mb-6">Startup & Investment News</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, i) => (
                    <div
                        key={i}
                        className="flex flex-col border rounded-lg transition overflow-hidden"
                    >
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-40 object-cover"
                        />
                        <div className="flex-1 p-4 flex flex-col">
                            <h2 className="line-clamp-2 text-lg font-semibold text-blue hover:underline mb-2">
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                    {article.title}
                                </a>
                            </h2>
                            <p className="line-clamp-4 text-gray-600 text-sm flex-1">{article.description}</p>
                            <span className="text-xs text-gray-400 mt-2">
                                {new Date(article.publishedAt).toLocaleDateString()} | {article.source}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    );
}
