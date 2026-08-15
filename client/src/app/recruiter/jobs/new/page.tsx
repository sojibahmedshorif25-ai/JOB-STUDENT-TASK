"use client";

import { RecruiterDashboard } from "@/components/layout/recruiter-dashboard";
import { JobForm } from "@/components/features/job-form";

export default function NewJobPage() {
  return (
    <RecruiterDashboard headerTitle="Post a job">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Post a new job</h1>
        <p className="text-sm text-muted-foreground">Reach thousands of skilled students.</p>
      </div>
      <JobForm />
    </RecruiterDashboard>
  );
}
