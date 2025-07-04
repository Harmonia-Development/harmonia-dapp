"use client";
import MembersDashboard from "@/components/members/MembersDashboard";
import { LayoutWrapper } from "@/components/ui/layout-wrapper";

const page = () => {
  return (
    <div className="bg-black h-full md:h-screen">
      <LayoutWrapper>
        <div className="min-w-screen flex justify-between items-center">
          <MembersDashboard />
        </div>
      </LayoutWrapper>
    </div>
  );
};

export default page;
