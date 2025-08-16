import { Outlet } from "react-router-dom";
import DashHeader from "./DashHeader";
import DashFooter from "./DashFooter";

const DashLayout = () => {
  // Layout component for dashboard pages, includes header, footer, and main content
  return (
    <>
      <DashHeader />
      <div className="dashboard__container">
        <Outlet />
      </div>
      <DashFooter />
    </>
  );
};
export default DashLayout;
