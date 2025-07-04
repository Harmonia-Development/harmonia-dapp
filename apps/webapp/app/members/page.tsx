"use client";
import MembersDashboard from "@/components/members/MembersDashboard";
import { LayoutWrapper } from "@/components/ui/layout-wrapper";
import { ThemeWrapper } from "@/components/ui/theme-wrapper";

const page = () => {
  return (
    <ThemeWrapper className="h-full md:h-screen">
      <LayoutWrapper>
        <div className="min-w-screen flex justify-between items-center">
          <MembersDashboard />
        </div>
      </LayoutWrapper>
    </ThemeWrapper>
  );
};

export default page;
