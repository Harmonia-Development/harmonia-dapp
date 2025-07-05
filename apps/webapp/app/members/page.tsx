"use client";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import MembersDashboard from "@/components/members/MembersDashboard";

const page = () => {
  return (
    <ErrorBoundary>
      <div className="bg-black h-full md:h-screen">
        <div className="min-w-screen flex justify-between items-center px-5 pt-4">
          <MembersDashboard />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default page;
