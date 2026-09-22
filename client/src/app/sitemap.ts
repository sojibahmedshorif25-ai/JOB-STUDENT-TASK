import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://job-student-task.vercel.app";
  const routes = [
    "",
    "/courses",
    "/jobs",
    "/projects",
    "/companies",
    "/interview-prep",
    "/api-docs",
    "/login",
    "/register",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
