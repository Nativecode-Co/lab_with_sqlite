const data = fetchApi("/charts/visit_count", "get", { type: "year" });

const visit_count = new ApexCharts(document.querySelector("#visit_count"), {
  chart: {
    fontFamily: "Nunito, sans-serif",
    height: 500,
    width: "100%",
    type: "bar",
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
visit_count.render();

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
});
