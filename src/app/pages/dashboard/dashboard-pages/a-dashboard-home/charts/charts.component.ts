import { Component, effect, input } from "@angular/core";
import { ISuperAdminResponse } from "../../../../../core/Interfaces/m-home/IHomeStatics";
import { ChartModule } from "primeng/chart";
import { CardModule } from "primeng/card";
import { CommonModule } from "@angular/common";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Color, NgxChartsModule, ScaleType } from "@swimlane/ngx-charts";
import { Chart } from "chart.js";
import { LoadingDataBannerComponent } from "../../../../../shared/components/loading-data-banner/loading-data-banner.component";

@Component({
  selector: "app-charts",
  standalone: true,
  imports: [ChartModule, CardModule, CommonModule, NgxChartsModule, LoadingDataBannerComponent],
  templateUrl: "./charts.component.html",
  styleUrl: "./charts.component.scss",
})
export class ChartsComponent {
  [x: string]: any;
  function(arg0: any) {
    throw new Error("Method not implemented.");
  }
  Statics = input<ISuperAdminResponse>();
  ngOnInit(): void {
    this.Statics();
  }

  constructor() {
    Chart.register(ChartDataLabels);

    effect(() => {
      this.Statics();
      this.initializeTotalComparisonData();
      // this.initializeBranchComparisonData();
      this.initializeBranchComparisonDataSecond();
    });
  }

  // Chart Data
  totalDeliveredData: any;
  totalRevenueData: any;
  branchOrderData: any[] | undefined = [];
  branchRevenueData: any[] | undefined = [];

  colorScheme: Color = {
    name: "customScheme",
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ["#F44336", "#2EB432"],
  };

  initializeTotalComparisonData() {
    // Pie chart for Total Delivered vs Cancelled Orders
    this.totalDeliveredData = {
      labels: ["Total Delivered Orders", "Total Cancelled Orders"],
      datasets: [
        {
          label: "Orders Comparison",
          data: [this.Statics()?.totalDelivered, this.Statics()?.totalCancelled],
          backgroundColor: ["#4caf50", "#f44336"],
          borderColor: ["#4caf50", "#f44336"],
          borderWidth: 1,
        },
      ],
    };

    // Pie chart for Total Delivered vs Cancelled Revenue
    this.totalRevenueData = {
      labels: ["Total Delivered Revenue", "Total Cancelled Revenue"],
      datasets: [
        {
          label: "Revenue Comparison",
          data: [this.Statics()?.totalDeliveredMoney, this.Statics()?.totalCancelledMoney],
          backgroundColor: ["#4caf50", "#f44336"],
          borderColor: ["#4caf50", "#f44336"],
          borderWidth: 1,
        },
      ],
    };
  }

  // Initialize Branch Comparison Data (Delivered vs Cancelled per branch)
  // initializeBranchComparisonData() {
  //   const branches = this.Statics()?.branches;

  //   // Super admin case: use full branches array
  //   if (branches && branches.length > 0) {
  //     this.branchOrderData = branches.map((branch) => ({
  //       labels: [branch.branch_name],
  //       datasets: [
  //         {
  //           label: "Delivered Orders",
  //           data: [branch.delivered_orders],
  //           backgroundColor: "#4caf50",
  //           borderColor: "#4caf50",
  //           borderWidth: 1,
  //         },
  //         {
  //           label: "Cancelled Orders",
  //           data: [branch.cancelled_orders],
  //           backgroundColor: "#f44336",
  //           borderColor: "#f44336",
  //           borderWidth: 1,
  //         },
  //       ],
  //     }));

  //     this.branchRevenueData = branches.map((branch) => ({
  //       labels: [branch.branch_name],
  //       datasets: [
  //         {
  //           label: "Delivered Revenue",
  //           data: [branch.delivered_orders_money],
  //           backgroundColor: "#4caf50",
  //           borderColor: "#4caf50",
  //           borderWidth: 1,
  //         },
  //         {
  //           label: "Cancelled Revenue",
  //           data: [branch.cancelled_orders_money],
  //           backgroundColor: "#f44336",
  //           borderColor: "#f44336",
  //           borderWidth: 1,
  //         },
  //       ],
  //     }));
  //   } else {
  //     // Regular branch user (no "branches" key in response)
  //     const fallbackBranchName = "Your Branch"; // You could pull this from a service or session

  //     this.branchOrderData = [
  //       {
  //         labels: [fallbackBranchName],
  //         datasets: [
  //           {
  //             label: "Delivered Orders",
  //             data: [this.Statics()?.totalDelivered ?? 0],
  //             backgroundColor: "#4caf50",
  //             borderColor: "#4caf50",
  //             borderWidth: 1,
  //           },
  //           {
  //             label: "Cancelled Orders",
  //             data: [this.Statics()?.totalCancelled ?? 0],
  //             backgroundColor: "#f44336",
  //             borderColor: "#f44336",
  //             borderWidth: 1,
  //           },
  //         ],
  //       },
  //     ];

  //     this.branchRevenueData = [
  //       {
  //         labels: [fallbackBranchName],
  //         datasets: [
  //           {
  //             label: "Delivered Revenue",
  //             data: [this.Statics()?.totalDeliveredMoney ?? 0],
  //             backgroundColor: "#4caf50",
  //             borderColor: "#4caf50",
  //             borderWidth: 1,
  //           },
  //           {
  //             label: "Cancelled Revenue",
  //             data: [this.Statics()?.totalCancelledMoney ?? 0],
  //             backgroundColor: "#f44336",
  //             borderColor: "#f44336",
  //             borderWidth: 1,
  //           },
  //         ],
  //       },
  //     ];
  //   }
  // }

  // Chart Options with DataLabels for displaying percentages on pie chart slices
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to grow in height
    plugins: {
      legend: {
        position: "top",
      },
      datalabels: {
        color: "#fff",
        anchor: "center",
        align: "center",
        font: { size: 16, weight: "bold" },
        formatter: (value: any, ctx: any) => {
          const total = ctx.dataset.data.reduce((sum: number, data: number) => sum + data, 0);
          return `${((value / total) * 100).toFixed(1)}%`;
        },
      },
    },
  };

  initializeBranchComparisonDataSecond() {
    const branches = this.Statics()?.branches;

    if (branches && branches.length > 0) {
      this.branchOrderData = branches.map((branch) => ({
        name: branch.branch_name,
        series: [
          { name: "Delivered Orders", value: branch.delivered_orders },
          { name: "Cancelled Orders", value: branch.cancelled_orders },
        ],
      }));

      this.branchRevenueData = branches.map((branch) => ({
        name: branch.branch_name,
        series: [
          { name: "Delivered Revenue", value: branch.delivered_orders_money },
          { name: "Cancelled Revenue", value: branch.cancelled_orders_money },
        ],
      }));
    } else {
      const fallbackBranchName = "Your Branch";

      this.branchOrderData = [
        {
          name: fallbackBranchName,
          series: [
            { name: "Delivered Orders", value: this.Statics()?.totalDelivered ?? 0 },
            { name: "Cancelled Orders", value: this.Statics()?.totalCancelled ?? 0 },
          ],
        },
      ];

      this.branchRevenueData = [
        {
          name: fallbackBranchName,
          series: [
            { name: "Delivered Revenue", value: this.Statics()?.totalDeliveredMoney ?? 0 },
            { name: "Cancelled Revenue", value: this.Statics()?.totalCancelledMoney ?? 0 },
          ],
        },
      ];
    }
  }
}
