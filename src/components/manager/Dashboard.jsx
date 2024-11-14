import { Card, Row, Col, Select, Spin } from "antd";
import { Line, Bar } from "react-chartjs-2";
import api from "../../config/axios";
import { ShoppingCartOutlined, DollarOutlined } from "@ant-design/icons";
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

const chartColors = [
  "rgba(59, 130, 246, 0.8)", // Màu gốc
  "rgba(59, 130, 246, 0.7)", // Màu giảm alpha
  "rgba(59, 130, 246, 0.6)", // Màu giảm alpha
  "rgba(59, 130, 246, 0.5)", // Màu giảm alpha
  "rgba(59, 130, 246, 0.4)", // Màu giảm alpha
];

function Dashboard() {
  // 1. Khai báo tất cả states trước
  const [topSellerData, setTopSellerData] = useState({
    labels: [],
    datasets: [
      {
        label: "Số package đã bán",
        data: [],
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  });

  const [statsYear, setStatsYear] = useState(
    new Date().getFullYear().toString()
  );
  const [chartYear, setChartYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);

  const [revenueData, setRevenueData] = useState({
    revenues: [],
    profits: [],
    labels: [],
  });

  const [monthlyTotals, setMonthlyTotals] = useState({
    revenue: 0,
    profit: 0,
  });

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

  // Add chartData state
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Tổng doanh thu",
        data: [],
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
        data: [],
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
  });

  // 2. Khai báo các hàm utility
  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // 3. Khai báo các hàm fetch data
  const fetchMonthlyStats = async (year, month) => {
    try {
      const [revenueResponse, profitResponse] = await Promise.all([
        api.get(`analytics/revenues/${year}`),
        api.get(`analytics/profits/${year}`),
      ]);

      if (
        revenueResponse.data.status === "success" &&
        profitResponse.data.status === "success"
      ) {
        const revenueMonthlyData =
          revenueResponse.data.details.data["year-dto"];
        const profitMonthlyData = profitResponse.data.details.data["year-dto"];

        const monthNames = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ];

        // Calculate monthly totals for the selected month
        const monthIndex = month - 1;
        const monthName = monthNames[monthIndex];

        setMonthlyTotals({
          revenue: revenueMonthlyData[monthName] || 0,
          profit: profitMonthlyData[monthName] || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
    }
  };

  const fetchChartRevenue = async (year) => {
    try {
      const [revenueResponse, profitResponse] = await Promise.all([
        api.get(`analytics/revenues/${year}`),
        api.get(`analytics/profits/${year}`),
      ]);

      if (
        revenueResponse.data.status === "success" &&
        profitResponse.data.status === "success"
      ) {
        const revenueMonthlyData =
          revenueResponse.data.details.data["year-dto"];
        const profitMonthlyData = profitResponse.data.details.data["year-dto"];

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const monthsToShow = year < currentYear ? 12 : currentMonth + 1;

        const monthNames = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ];

        const revenues = monthNames
          .slice(0, monthsToShow)
          .map((month) => revenueMonthlyData[month]);

        const profits = monthNames
          .slice(0, monthsToShow)
          .map((month) => profitMonthlyData[month]);

        const labels = Array.from(
          { length: monthsToShow },
          (_, i) => `Tháng ${i + 1}`
        );

        setChartData({
          labels,
          datasets: [
            {
              ...chartData.datasets[0],
              data: revenues,
            },
            {
              ...chartData.datasets[1],
              data: profits,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching chart revenue:", error);
    }
  };

  const fetchTotalOrders = async (year, month) => {
    try {
      const monthStr = month.toString().padStart(2, "0");
      const lastDay = getLastDayOfMonth(year, month);

      const fromStr = `${year}-${monthStr}-01`;
      const toStr = `${year}-${monthStr}-${lastDay}`;

      const response = await api.get(
        `analytics/orders?from-date=${fromStr}&to-date=${toStr}`
      );
      // console.log(" + ", response.data);

      if (response.data.status === "success") {
        setTotalOrders(response.data.details.data["number-of-orders"]);
      }
    } catch (error) {
      console.error("Error fetching total orders:", error);
      setTotalOrders(0);
    }
  };

  const fetchTopPackages = async (year) => {
    try {
      const response = await api.get(`analytics/packages/top/5/year/${year}`);
      console.log(response.data);

      if (response.data.status === "success") {
        let topPackages = response.data.details.data["top-packages"];

        // Ensure we always have exactly 5 items
        while (topPackages.length < 5) {
          topPackages.push({
            "package-id": null,
            "package-name": "N/A",
            "kit-id": null,
            "kit-name": "",
            "sold-quantity": 0,
          });
        }

        // Transform API data for chart
        const chartData = {
          labels: topPackages.map((pkg) =>
            pkg["package-name"] === "N/A"
              ? "Chưa có dữ liệu"
              : pkg["package-name"] + " - " + pkg["kit-name"]
          ),
          datasets: [
            {
              label: "Số package đã bán",
              data: topPackages.map((pkg) => pkg["sold-quantity"]),
              backgroundColor: chartColors,
              borderColor: chartColors,
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
            backgroundColor: chartColors,
            borderColor: chartColors,
            borderWidth: 1,
          },
        ],
      };
      setTopSellerData(emptyData);
      console.error("Error fetching top packages:", error);
    }
  };

  const fetchTopRevenuePackages = async (year) => {
    try {
      const fromDate = `${year}-01-01`;
      const toDate = `${year}-12-31`;

      const response = await api.get(
        `analytics/package/sale?from-date=${fromDate}&to-date=${toDate}`
      );

      if (response.data.status === "success") {
        let packages = response.data.details.data.packages;

        // Ensure we always have exactly 5 items
        while (packages.length < 5) {
          packages.push({
            "kit-name": "N/A",
            "package-name": "N/A",
            "total-package-price": 0,
          });
        }

        setTopRevenueChartData({
          labels: packages.map((pkg) =>
            pkg["kit-name"] === "N/A"
              ? "Chưa có dữ liệu"
              : pkg["package-name"] + " - " + pkg["kit-name"]
          ),
          datasets: [
            {
              label: "Doanh thu",
              data: packages.map((pkg) => pkg["total-package-price"]),
              backgroundColor: chartColors,
              borderColor: chartColors,
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
            backgroundColor: chartColors,
            borderColor: chartColors,
            borderWidth: 1,
          },
        ],
      });
    }
  };

  // 4. Khai báo các hàm xử lý sự kiện
  const handleStatsYearChange = (value) => {
    setStatsYear(value);
  };

  const handleChartYearChange = (value) => {
    setChartYear(value);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  // 5. Khai báo các useEffect
  // Initialize years on mount
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2020; year--) {
      years.push(year);
    }
    setAvailableYears(years);
    setStatsYear(currentYear.toString());
    setChartYear(currentYear.toString());
  }, []);

  // Effect for stats data
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchTotalOrders(statsYear, selectedMonth),
          fetchMonthlyStats(statsYear, selectedMonth),
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatsData();
  }, [statsYear, selectedMonth]);

  // Effect for chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchChartRevenue(chartYear),
          fetchTopPackages(chartYear),
          fetchTopRevenuePackages(chartYear),
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, [chartYear]);

  // 6. Khai báo các biến phụ thuộc vào state
  const stats = [
    {
      title: "Tổng Đơn Hàng",
      value: (totalOrders || 0).toLocaleString("vi-VN"),
      icon: <ShoppingCartOutlined className="text-yellow-500" />,
    },
    {
      title: "Tổng Lợi Nhuận",
      value: monthlyTotals.profit.toLocaleString("vi-VN") + " đ",
      icon: <DollarOutlined className="text-green-500" />,
    },
    {
      title: "Tổng Doanh Thu",
      value: monthlyTotals.revenue.toLocaleString("vi-VN") + " đ",
      icon: <DollarOutlined className="text-green-500" />,
    },
  ];

  //style cho chart
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
        // max: 3, // Giới hạn tối đa là 3
        ticks: {
          stepSize: 1, // Mỗi bước nhảy là 1
          precision: 0, // Chỉ hiển thị số nguyên
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
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

  const handleDownloadReport = () => {
    console.log("Downloading report...");
  };

  return (
    <div className="p-6 bg-blue-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Stats cards with their own year/month selectors */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Thống kê theo tháng
          </h2>
          <div className="flex gap-4 items-center">
            <Select
              value={statsYear}
              className="w-32"
              options={availableYears.map((year) => ({
                value: year.toString(),
                label: year.toString(),
              }))}
              onChange={handleStatsYearChange}
              loading={isLoading}
              disabled={isLoading}
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
              onChange={handleMonthChange}
              loading={isLoading}
              disabled={isLoading}
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
                    <h2 className="text-3xl font-bold text-gray-800 pb-4">
                      {stat.value}
                    </h2>
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
                    }`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Charts section with its own year selector */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Biểu đồ thống kê</h2>
          <Select
            value={chartYear}
            className="w-32"
            options={availableYears.map((year) => ({
              value: year.toString(),
              label: year.toString(),
            }))}
            onChange={handleChartYearChange}
            loading={isLoading}
            disabled={isLoading}
          />
        </div>

        <Card className="border-0 rounded-xl hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Sales Details</h2>
              <p className="text-gray-500 text-sm mt-1">
                Doanh thu và lợi nhuận năm {chartYear}
              </p>
            </div>
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
                    Package được bán nhiều nhất năm {chartYear}
                  </p>
                </div>
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
                    Package có doanh thu cao nhất năm {chartYear}
                  </p>
                </div>
              </div>
              <div className="w-full h-[400px]">
                <Bar data={topRevenueChartData} options={topRevenueOptions} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Dashboard;
