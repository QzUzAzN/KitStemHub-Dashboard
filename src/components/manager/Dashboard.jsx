import { Card, Row, Col, Select } from "antd";
import { Line, Bar } from "react-chartjs-2";
import api from "../../config/axios";
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
import { useState, useEffect } from "react";

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

// Add this function at the top level, after the ChartJS.register
const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

function Dashboard() {
  const [topSellerData, setTopSellerData] = useState({
    labels: [],
    datasets: [
      {
        label: "Số package đã bán",
        data: [],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  });

  const [selectedYear, setSelectedYear] = useState("2024");

  // Thêm state mới để lưu dữ liệu doanh thu
  const [revenueData, setRevenueData] = useState({
    revenues: Array(12).fill(0),
    profits: Array(12).fill(0),
  });

  // Thêm hàm để fetch dữ liệu doanh thu
  const fetchRevenueData = async (year) => {
    try {
      const revenues = [];
      const profits = [];

      // Fetch dữ liệu cho từng tháng
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, "0");
        const daysInMonth = getDaysInMonth(year, month);

        const fromDate = `${year}-${monthStr}-01`;
        const toDate = `${year}-${monthStr}-${daysInMonth}`;

        // Fetch revenue data
        const revenueResponse = await api.get(
          `analytics/revenues?from-date=${fromDate}&to-date=${toDate}`
        );

        // Fetch profit data
        const profitResponse = await api.get(
          `analytics/profits?from-date=${fromDate}&to-date=${toDate}`
        );

        if (revenueResponse.data.status === "success") {
          revenues.push(revenueResponse.data.details.data);
        }

        if (profitResponse.data.status === "success") {
          profits.push(profitResponse.data.details.data.profit);
        }
      }

      setRevenueData({
        revenues,
        profits,
      });
    } catch (error) {
      console.error("Error fetching revenue/profit data:", error);
    }
  };

  // Thêm useEffect để fetch dữ liệu khi năm thay đổi
  useEffect(() => {
    fetchRevenueData(selectedYear);
  }, [selectedYear]);

  // Cập nhật chartData để sử dụng dữ liệu thực từ API
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
        data: revenueData.revenues,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Tổng lợi nhuận",
        data: revenueData.profits,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
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
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 8,
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
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 8,
        },
      },
    },
  };

  // Add new state for total orders
  const [totalOrders, setTotalOrders] = useState(0);

  // Add function to fetch total orders
  const fetchTotalOrders = async (year, month) => {
    try {
      const monthStr = month.toString().padStart(2, "0");
      const lastDay = getLastDayOfMonth(year, month);

      const fromStr = `${year}-${monthStr}-01`;
      const toStr = `${year}-${monthStr}-${lastDay}`;

      const response = await api.get(
        `analytics/orders?from-date=${fromStr}&to-date=${toStr}`
      );
      console.log(" + " + response.data);

      if (response.data.status === "success") {
        setTotalOrders(response.data.details.data["number-of-orders"]);
      }
    } catch (error) {
      console.error("Error fetching total orders:", error);
      setTotalOrders(0);
    }
  };

  // Update the stats array definition
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
      value: (totalOrders || 0).toLocaleString("vi-VN"),
      change: "+1.3%",
      isIncrease: true,
      icon: <ShoppingCartOutlined className="text-yellow-500" />,
    },
    {
      title: "Tổng Lợi Nhuận",
      value:
        (
          revenueData.profits.reduce((a, b) => a + (b || 0), 0) || 0
        ).toLocaleString("vi-VN") + " đ",
      change: "-4.3%",
      isIncrease: false,
      icon: <DollarOutlined className="text-green-500" />,
    },
    {
      title: "Tổng Doanh Thu",
      value:
        (
          revenueData.revenues.reduce((a, b) => a + (b || 0), 0) || 0
        ).toLocaleString("vi-VN") + " đ",
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

  // Add fetch function
  const fetchTopPackages = async (year) => {
    try {
      const response = await api.get(`analytics/packages/top/5/year${year}`);
      console.log(response.data);

      if (response.data.status === "success") {
        let topPackages = response.data.details.data["top-packages"];

        // Ensure we always have exactly 5 items
        while (topPackages.length < 5) {
          topPackages.push({
            "package-name": "N/A",
            "kit-name": "",
            "sold-quantity": 0,
          });
        }

        // Take only the first 5 items if we somehow get more
        topPackages = topPackages.slice(0, 5);

        // Transform API data for chart
        const chartData = {
          labels: topPackages.map((pkg) =>
            pkg["package-name"] === "N/A"
              ? "Chưa có dữ liệu"
              : `${pkg["package-name"]} (${pkg["kit-name"]})`
          ),
          datasets: [
            {
              label: "Số package đã bán",
              data: topPackages.map((pkg) => pkg["sold-quantity"]),
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderColor: "rgb(59, 130, 246)",
              borderWidth: 1,
            },
          ],
        };

        setTopSellerData(chartData);
      }
    } catch (error) {
      // If there's an error, show empty data with 5 placeholder items
      const emptyData = {
        labels: Array(5).fill("Chưa có dữ liệu"),
        datasets: [
          {
            label: "Số package đã bán",
            data: Array(5).fill(0),
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 1,
          },
        ],
      };
      setTopSellerData(emptyData);
      console.error("Error fetching top packages:", error);
    }
  };

  // Add new state for top revenue data
  const [topRevenueChartData, setTopRevenueChartData] = useState({
    labels: Array(5).fill("Chưa có dữ liệu"),
    datasets: [
      {
        label: "Doanh thu",
        data: Array(5).fill(0),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  });

  // Add this function to get the last day of a month
  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // Update the fetch function for top revenue packages
  const fetchTopRevenuePackages = async (year, month) => {
    try {
      // Format month to ensure it's two digits
      const monthStr = month.toString().padStart(2, "0");
      const lastDay = getLastDayOfMonth(year, month);

      const fromDate = `${year}-${monthStr}-01`;
      const toDate = `${year}-${monthStr}-${lastDay}`;

      const response = await api.get(
        `analytics/package/sale?from-date=${fromDate}&to-date=${toDate}`
      );

      if (response.data.status === "success") {
        let packages = response.data.details.data.packages;

        // Ensure we always have exactly 5 items
        while (packages.length < 5) {
          packages.push({
            "kit-name": "N/A",
            "total-package-price": 0,
          });
        }
        packages = packages.slice(0, 5);

        setTopRevenueChartData({
          labels: packages.map((pkg) =>
            pkg["kit-name"] === "N/A" ? "Chưa có dữ liệu" : pkg["kit-name"]
          ),
          datasets: [
            {
              label: "Doanh thu",
              data: packages.map((pkg) => pkg["total-package-price"]),
              backgroundColor: "rgba(34, 197, 94, 0.8)",
              borderColor: "rgb(34, 197, 94)",
              borderWidth: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching top revenue packages:", error);
      setTopRevenueChartData({
        labels: Array(5).fill("Chưa có dữ liệu"),
        datasets: [
          {
            label: "Doanh thu",
            data: Array(5).fill(0),
            backgroundColor: "rgba(34, 197, 94, 0.8)",
            borderColor: "rgb(34, 197, 94)",
            borderWidth: 1,
          },
        ],
      });
    }
  };

  // Add state for selected month
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Update useEffect to use year and month
  useEffect(() => {
    fetchTopPackages(selectedYear);
    fetchTopRevenuePackages(selectedYear, selectedMonth);
    fetchTotalOrders(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Update the year selection handler
  const handleYearChange = (value) => {
    setSelectedYear(value);
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
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 5, // Đặt bước nhảy là 5
          maxTicksLimit: 10, // Giới hạn số lượng điểm đánh dấu để tránh quá đông
        },
        grid: {
          display: true,
        },
      },
      y: {
        grid: {
          display: true,
        },
      },
    },
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
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
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
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 8,
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
      y: {
        grid: {
          display: false,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 8,
          font: {
            weight: 500,
          },
        },
      },
    },
  };

  // Cập nhật handler cho Select của Sales Details
  const handleSalesYearChange = (value) => {
    setSelectedYear(value);
  };

  return (
    <div className="p-6 bg-blue-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-4">
          <Select
            value={selectedYear}
            className="w-32"
            options={[
              { value: "2024", label: "2024" },
              { value: "2023", label: "2023" },
              { value: "2022", label: "2022" },
            ]}
            onChange={(value) => setSelectedYear(value)}
          />
          <Select
            value={selectedMonth}
            className="w-32"
            options={[
              { value: 1, label: "Tháng 1" },
              { value: 2, label: "Tháng 2" },
              { value: 3, label: "Tháng 3" },
              { value: 4, label: "Tháng 4" },
              { value: 5, label: "Tháng 5" },
              { value: 6, label: "Tháng 6" },
              { value: 7, label: "Tháng 7" },
              { value: 8, label: "Tháng 8" },
              { value: 9, label: "Tháng 9" },
              { value: 10, label: "Tháng 10" },
              { value: 11, label: "Tháng 11" },
              { value: 12, label: "Tháng 12" },
            ]}
            onChange={(value) => setSelectedMonth(value)}
          />
        </div>
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
            value={selectedYear}
            onChange={handleSalesYearChange}
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
                value={selectedYear}
                onChange={handleYearChange}
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
                defaultValue={selectedMonth}
                className="w-32"
                onChange={(value) => setSelectedMonth(value)}
                options={[
                  { value: 1, label: "Tháng 1" },
                  { value: 2, label: "Tháng 2" },
                  { value: 3, label: "Tháng 3" },
                  { value: 4, label: "Tháng 4" },
                  { value: 5, label: "Tháng 5" },
                  { value: 6, label: "Tháng 6" },
                  { value: 7, label: "Tháng 7" },
                  { value: 8, label: "Tháng 8" },
                  { value: 9, label: "Tháng 9" },
                  { value: 10, label: "Tháng 10" },
                  { value: 11, label: "Tháng 11" },
                  { value: 12, label: "Tháng 12" },
                ]}
              />
            </div>
            <div className="w-full h-[400px]">
              <Bar data={topRevenueChartData} options={topRevenueOptions} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
