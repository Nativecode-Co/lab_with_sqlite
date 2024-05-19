const data = fetchApi("/charts/visit_count", "get", { type: "year" });
const counts = fetchApi("/charts/visit_counts");
const { male, female } = fetchApi("/charts/gender_statistic");
const { child, young, adult, old, very_old } = fetchApi(
  "/charts/age_statistic"
);
const { oldPatients, newPatients } = fetchApi("/charts/old_and_new_patients");

const visit_count = new ApexCharts(document.querySelector("#visit_count"), {
  chart: {
    fontFamily: "Nunito, sans-serif",
    height: 500,
    width: "100%",
    type: "area",
    zoom: {
      enabled: true,
    },
    dropShadow: {
      enabled: true,
      opacity: 0.3,
      blur: 5,
      left: -7,
      top: 22,
    },
    toolbar: {
      show: false,
    },
  },
  colors: ["#3460FD"],
  dataLabels: {
    enabled: true,
  },
  stroke: {
    curve: "smooth",
  },
  series: [
    {
      name: "عدد الزيارات",
      data: data.map((item) => item.count),
    },
  ],

  xaxis: {
    categories: data.map((item) => item.date),
    axisBorder: {
      show: true,
    },
    axisTicks: {
      show: true,
    },
    crosshairs: {
      show: true,
    },
    labels: {
      offsetX: 0,
      offsetY: 5,
      style: {
        fontSize: "20px",
        fontFamily: "Nunito, sans-serif",
        cssClass: "apexcharts-xaxis-title",
      },
    },
  },
  yaxis: {
    labels: {
      formatter: (value, index) => {
        // to one decimal
        return value.toFixed(1);
      },
      offsetX: -25,
      offsetY: 0,
      style: {
        fontSize: "20px",
        fontFamily: "Nunito, sans-serif",
        cssClass: "apexcharts-yaxis-title",
      },
    },
    width: "100%",
  },
  grid: {
    borderColor: "#e0e6ed",
    strokeDashArray: 5,
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    offsetY: -50,
    fontSize: "20px",
    fontFamily: "Nunito, sans-serif",
    markers: {
      width: 10,
      height: 10,
      strokeWidth: 0,
      strokeColor: "#fff",
      fillColors: undefined,
      radius: 12,
      onClick: undefined,
      offsetX: 0,
      offsetY: 0,
    },
    itemMargin: {
      horizontal: 0,
      vertical: 20,
    },
  },
  tooltip: {
    theme: "dark",
    marker: {
      show: true,
    },
    x: {
      show: false,
    },
  },

  responsive: [
    {
      breakpoint: 575,
      options: {
        legend: {
          offsetY: -30,
        },
      },
    },
  ],
});

const genderChart = new ApexCharts(document.querySelector("#gender-chart"), {
  chart: {
    fontFamily: "Nunito, sans-serif",
    type: "donut",
  },
  colors: ["#3460FD", "#FF4560"],
  series: [Number(male), Number(female)],
  labels: ["ذكور", "إناث"],
  legend: {
    fontSize: "20px",
    fontFamily: "Nunito, sans-serif",
    position: "bottom",
    horizontalAlign: "center",
    markers: {
      width: 10,
      height: 10,
      strokeWidth: 0,
      strokeColor: "#fff",
      fillColors: undefined,
      radius: 12,
      onClick: undefined,
      offsetX: 0,
      offsetY: 0,
    },
    itemMargin: {
      horizontal: 0,
      vertical: 20,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "50%",
      },
    },
  },
  responsive: [
    {
      breakpoint: 575,
      options: {
        legend: {
          offsetY: -30,
        },
      },
    },
  ],
});

// line chart
const ageChart = new ApexCharts(document.querySelector("#age-chart"), {
  chart: {
    fontFamily: "Nunito, sans-serif",
    type: "line",
    width: 400,
  },
  colors: ["#3460FD"],
  series: [
    {
      name: "العمر",
      data: [
        Number(child),
        Number(young),
        Number(adult),
        Number(old),
        Number(very_old),
      ],
    },
  ],
  xaxis: {
    categories: ["0-10", "10-20", "20-40", "40-60", "60-"],
  },
  yaxis: {
    labels: {
      formatter: (value, index) => {
        // to one decimal
        return value.toFixed(1);
      },
      offsetX: -25,
      offsetY: 0,
      style: {
        fontSize: "20px",
        fontFamily: "Nunito, sans-serif",
        cssClass: "apexcharts-yaxis-title",
      },
    },
    width: "100%",
  },
  grid: {
    borderColor: "#e0e6ed",
    strokeDashArray: 5,
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    offsetY: -50,
    fontSize: "20px",
    fontFamily: "Nunito, sans-serif",
    markers: {
      width: 10,
      height: 10,
      strokeWidth: 0,
      strokeColor: "#fff",
      fillColors: undefined,
      radius: 12,
      onClick: undefined,
      offsetX: 0,
      offsetY: 0,
    },
    itemMargin: {
      horizontal: 0,
      vertical: 20,
    },
  },
  tooltip: {
    theme: "dark",
    marker: {
      show: true,
    },
    x: {
      show: false,
    },
  },
});

visit_count.render();
genderChart.render();
ageChart.render();

// dom ready pure js
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    visit_count.updateOptions({
      chart: {
        height: 500,
      },
    });
  }, 100);
  // listin to any #visit_count_type button click
  for (const item of document.querySelectorAll("#visit_count_type")) {
    item.addEventListener("click", async (e) => {
      const gender = document.querySelector("#visit_count_gender .active")
        .dataset.gender;
      const age = document.querySelector("#visit_count_age .active").dataset
        .age;

      const data = fetchApi("/charts/visit_count", "get", {
        type: e.target.dataset.type,
        gender,
        age,
      });
      if (data.length === 0) {
        // apexcharts noData
        Swal.fire({
          icon: "warning",
          title: "للاسف!",
          text: "لا يوجد زيارات لهذه الفترة",
          confirmButtonText: "حسناً",
        });
      } else {
        // remove active class from all buttons
        for (const item of document.querySelectorAll(
          "#visit_count_type .active"
        )) {
          item.classList.remove("active");
        }
        e.target.classList.add("active");
        visit_count.updateSeries([
          {
            name: "عدد الزيارات",
            data: data.map((item) => item.count),
          },
        ]);
        visit_count.updateOptions({
          xaxis: {
            categories: data.map((item) => item.date),
          },
        });
      }
    });
  }

  for (const item of document.querySelectorAll("#visit_count_gender")) {
    item.addEventListener("click", async (e) => {
      const type = document.querySelector("#visit_count_type .active").dataset
        .type;
      const age = document.querySelector("#visit_count_age .active").dataset
        .age;
      const data = fetchApi("/charts/visit_count", "get", {
        type,
        gender: e.target.dataset.gender,
        age,
      });
      if (data.length === 0) {
        // apexcharts noData
        Swal.fire({
          icon: "warning",
          title: "للاسف!",
          text: "لا يوجد زيارات لهذه الفترة",
          confirmButtonText: "حسناً",
        });
      } else {
        // remove active class from all buttons
        for (const item of document.querySelectorAll(
          "#visit_count_gender .active"
        )) {
          item.classList.remove("active");
        }
        e.target.classList.add("active");
        visit_count.updateSeries([
          {
            name: "عدد الزيارات",
            data: data.map((item) => item.count),
          },
        ]);
        visit_count.updateOptions({
          xaxis: {
            categories: data.map((item) => item.date),
          },
        });
      }
    });
  }

  for (const item of document.querySelectorAll("#visit_count_age")) {
    item.addEventListener("click", async (e) => {
      const type = document.querySelector("#visit_count_type .active").dataset
        .type;
      const gender = document.querySelector("#visit_count_gender .active")
        .dataset.gender;
      const data = fetchApi("/charts/visit_count", "get", {
        type,
        gender,
        age: e.target.dataset.age,
      });
      if (data.length === 0) {
        // apexcharts noData
        Swal.fire({
          icon: "warning",
          title: "للاسف!",
          text: "لا يوجد زيارات لهذه الفترة",
          confirmButtonText: "حسناً",
        });
      } else {
        // remove active class from all buttons
        for (const item of document.querySelectorAll(
          "#visit_count_age .active"
        )) {
          item.classList.remove("active");
        }
        e.target.classList.add("active");
        visit_count.updateSeries([
          {
            name: "عدد الزيارات",
            data: data.map((item) => item.count),
          },
        ]);
        visit_count.updateOptions({
          xaxis: {
            categories: data.map((item) => item.date),
          },
        });
      }
    });
  }

  // counts stats
  const { dayCount, weekCount, monthCount, yearCount } = counts;
  const dayCountElement = document.querySelector(".static-count.day");
  const weekCountElement = document.querySelector(".static-count.week");
  const monthCountElement = document.querySelector(".static-count.month");
  const yearCountElement = document.querySelector(".static-count.year");
  const oldPatientsElement = document.querySelector(".old_patients");
  const newPatientsElement = document.querySelector(".new_patients");

  dayCountElement.innerHTML = dayCount;
  weekCountElement.innerHTML = weekCount;
  monthCountElement.innerHTML = monthCount;
  yearCountElement.innerHTML = yearCount;
  oldPatientsElement.innerHTML = oldPatients;
  newPatientsElement.innerHTML = newPatients;
});
