"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BlogSection() {
  const blogs = [
    {
      title: "Top 5 Simple Mistakes that Founders Often Make in Investor Pitches",
      desc: "Learn how to avoid the most common pitfalls and make your startup pitch investor-ready.",
      link: "#",
      img: "/images/blogs-1.png",
    },
    {
      title:
        "The Future of Venture Capital: How Data-Driven Platforms Are Changing the Game",
      desc: "Discover how modern tools like Pitchub are reshaping the fundraising landscape.",
      link: "#",
      img: "/images/blogs-2.png",
    },
    {
      title:
        "Investor Matchmaking: Why Finding the Right Fit Matters More Than Ever",
      desc: "Explore how matching with the right investors creates long-term success.",
      link: "#",
      img: "/images/blogs-3.png",
    },
  ];

  return (
    <section id="blog" className="px-6 py-20">
      <div className="max-w-6xl mx-auto text-left">
        <h2 className="text-3xl font-semibold">Latest Insights</h2>
        <p className="mt-4 text-gray-600 max-w-2xl">
          Stay updated with tips, insights, and trends from the world of<br/>
          startups and investors.
        </p>
        <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
          {blogs.map((blog, i) => (
            <Card
              key={i}
              className="shadow-md border-0 hover:shadow-xl transition rounded-lg overflow-hidden py-0 gap-2"
            >
              <div className="relative w-full h-48">
                <Image
                  src={blog.img}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="p-0 px-5 mt-2">
                <CardTitle className="text-lg font-bold mb-0 p-0">
                  {blog.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 px-5">
                <p className="text-gray-600 text-sm">{blog.desc}</p>
                <Link href={blog.link} className="text-sm py-5 font-bold block">
                  Read More <ArrowRight className="h-4 w-4 inline" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
