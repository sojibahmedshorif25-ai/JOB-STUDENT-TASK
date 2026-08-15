import { PublicLayout } from "@/components/layout/public-layout";
import { Hero } from "@/components/landing/hero";
import { TrustedTech } from "@/components/landing/trusted-tech";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedCourses } from "@/components/landing/featured-courses";
import { FeaturedJobs } from "@/components/landing/featured-jobs";
import { CareerPath } from "@/components/landing/career-path";
import { ProjectShowcase } from "@/components/landing/project-showcase";
import { SuccessStories } from "@/components/landing/success-stories";
import { Statistics } from "@/components/landing/statistics";
import { FinalCTA } from "@/components/landing/final-cta";

export default function HomePage() {
  return (
    <PublicLayout>
      <Hero />
      <TrustedTech />
      <HowItWorks />
      <FeaturedCourses />
      <FeaturedJobs />
      <CareerPath />
      <ProjectShowcase />
      <SuccessStories />
      <Statistics />
      <FinalCTA />
    </PublicLayout>
  );
}
