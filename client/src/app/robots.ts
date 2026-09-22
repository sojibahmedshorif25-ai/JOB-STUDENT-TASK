import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/recruiter/", "/dashboard/"],
    },
    sitemap: "https://job-student-task.vercel.app/sitemap.xml",
  };
}
