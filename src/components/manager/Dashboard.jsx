import React from "react";
import { Card, Row, Col, Select } from "antd";
import { Line, Bar } from "react-chartjs-2";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  BarElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// Thêm hàm format tiền mới
const formatCurrency = (value) => {
  if (value >= 1000000000) {
    return `${value / 1000000000} Tỷ đ`;
  }
  if (value >= 1000000) {
    return `${value / 1000000} Tr đ`;
  }
  return new Intl.NumberFormat("vi-VN").format(value) + " đ";
};

function Dashboard() {
  const chartData = {
    labels: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
    datasets: [
      {
        label: "Tổng doanh thu",
        data: [
          150000000, 180000000, 200000000, 190000000, 220000000, 250000000,
          240000000, 260000000, 280000000, 270000000, 290000000, 310000000,
        ],
        borderColor: "rgb(59, 130, 246)", // blue
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Tổng lợi nhuận",
        data: [
          50000000, 60000000, 70000000, 65000000, 75000000, 85000000, 80000000,
          90000000, 95000000, 92000000, 98000000, 105000000,
        ],
        borderColor: "rgb(34, 197, 94)", // green
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(value);
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const stats = [
    {
      title: "Tổng Khách Hàng",
      value: "40,689",
      change: "+8.5%",
      isIncrease: true,
      icon: <UserOutlined className="text-blue-500" />,
    },
    {
      title: "Tổng Đơn Hàng",
      value: "10293",
      change: "+1.3%",
      isIncrease: true,
      icon: <ShoppingCartOutlined className="text-yellow-500" />,
    },
    {
      title: "Tổng Lợi Nhuận",
      value: "89 Triệu đ", // Thay đổi từ "$89,000"
      change: "-4.3%",
      isIncrease: false,
      icon: <DollarOutlined className="text-green-500" />,
    },
    {
      title: "Tổng Thu Nhập",
      value: "89 Triệu đ", // Thay đổi từ "$89,000"
      change: "-4.3%",
      isIncrease: false,
      icon: <DollarOutlined className="text-green-500" />,
    },
    {
      title: "Tổng Sản Phẩm",
      value: "2040",
      change: "+1.8%",
      isIncrease: true,
      icon: <FieldTimeOutlined className="text-red-300" />,
    },
    {
      title: "Tổng Phản Hồi",
      value: "2040",
      change: "+1.8%",
      isIncrease: true,
      icon: <FieldTimeOutlined className="text-red-300" />,
    },
  ];

  // Thêm data cho top 5 best-seller (số lượng gói bán ra)
  const topSellerData = {
    labels: [
      "Arduino UNO R3 PRO KIT",
      "Arduino UNO R3",
      "Sensor Kit V2 for Arduino",
      "UNO R3 starter kit",
      "Raspberry Pi 5 Starter Kit",
    ],
    datasets: [
      {
        label: "Số package đã bán",
        data: [1250, 980, 850, 720, 650],
        backgroundColor: "rgba(59, 130, 246, 0.8)", // blue
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  const topSellerOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.x.toLocaleString(
              "vi-VN"
            )} package`;
          },
        },
      },
    },
  };

  // Data cho top 5 doanh thu cao nhất
  const topRevenueData = {
    labels: [
      "Arduino UNO R3 PRO KIT",
      "Arduino UNO R3",
      "Sensor Kit V2 for Arduino",
      "UNO R3 starter kit",
      "Raspberry Pi 5 Starter Kit",
    ],
    datasets: [
      {
        label: "Doanh thu",
        data: [850000000, 620000000, 480000000, 350000000, 280000000],
        backgroundColor: "rgba(34, 197, 94, 0.8)", // green
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  const topRevenueOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${formatCurrency(
              context.parsed.x
            )}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true,
        },
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
      y: {
        grid: {
          display: true,
        },
      },
    },
  };

  return (
    <div className="p-6 bg-blue-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Select
          defaultValue="October"
          className="w-32"
          options={[
            { value: "October", label: "2024" },
            { value: "November", label: "2023" },
            { value: "December", label: "2022" },
          ]}
        />
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 rounded-xl">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <p className="text-gray-500 font-medium">{stat.title}</p>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </h2>
                  <p
                    className={`flex items-center text-sm font-medium ${
                      stat.isIncrease ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {stat.change}
                    <span className="text-gray-500 ml-1.5">
                      {stat.isIncrease ? "Up" : "Down"} from yesterday
                    </span>
                  </p>
                </div>
                <div
                  className={`p-4 rounded-full bg-opacity-10 ${
                    index === 0
                      ? "bg-blue-500/10"
                      : index === 1
                      ? "bg-yellow-500/10"
                      : index === 2
                      ? "bg-emerald-500/10"
                      : index === 3
                      ? "bg-emerald-500/10"
                      : "bg-rose-500/10"
                  }`}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="mt-8 border-0 rounded-xl hover:shadow-lg transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Sales Details</h2>
            <p className="text-gray-500 text-sm mt-1">
              Doanh thu và lợi nhuận năm 2024
            </p>
          </div>
          <Select
            defaultValue="2024"
            className="w-32"
            options={[
              { value: "2024", label: "2024" },
              { value: "2023", label: "2023" },
              { value: "2022", label: "2022" },
            ]}
          />
        </div>
        <div className="w-full h-[400px]">
          <Line data={chartData} options={options} />
        </div>
      </Card>

      <Row gutter={[16, 16]} className="mt-8">
        <Col xs={24} lg={12}>
          <Card className="border-0 rounded-xl hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Top 5 Best-seller
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Package được bán nhiều nhất
                </p>
              </div>
              <Select
                defaultValue="2024"
                className="w-32"
                options={[
                  { value: "2024", label: "2024" },
                  { value: "2023", label: "2023" },
                  { value: "2022", label: "2022" },
                ]}
              />
            </div>
            <div className="w-full h-[400px]">
              <Bar data={topSellerData} options={topSellerOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="border-0 rounded-xl hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Top 5 Doanh Thu
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Package có doanh thu cao nhất
                </p>
              </div>
              <Select
                defaultValue="2024"
                className="w-32"
                options={[
                  { value: "2024", label: "2024" },
                  { value: "2023", label: "2023" },
                  { value: "2022", label: "2022" },
                ]}
              />
            </div>
            <div className="w-full h-[400px]">
              <Bar data={topRevenueData} options={topRevenueOptions} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
