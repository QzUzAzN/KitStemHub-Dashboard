import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import HeaderNavbar from "../components/admin/HeaderNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";

const { Content } = Layout;

const AdminPage = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderNavbar />
      <Layout>
        <AdminSidebar />
        <Layout>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
