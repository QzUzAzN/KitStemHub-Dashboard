import { Layout } from "antd";
import React from "react";
import HeaderNavbar from "../components/staff/HeaderNavbar";
const { Content } = Layout;
import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/staff/StaffSidebar";
function StaffPage() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderNavbar />
      <Layout>
        <StaffSidebar />
        <Layout>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default StaffPage;
