import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { WEB_SITE_BASE_URL } from '../../../../core/constants/WEB_SITE_BASE_UTL';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

interface StatisticsData {
  users: number;
  categories: number;
  products: number;
  pendingorders: number;
  confirmedorders: number;
  cancelledorders: number;
}

@Component({
  selector: 'app-home-statistics',
  templateUrl: './home-statistics.component.html',
  styleUrls: ['./home-statistics.component.scss'],
  standalone: true,
  imports: [ChartModule,NgxSpinnerModule]
})
export class HomeStatisticsComponent implements OnInit {
  statisticsData!: StatisticsData;
  ngxSpinnerService = inject(NgxSpinnerService);
  
  // Chart data
  overviewChartData: any;
  ordersChartData: any;
  inventoryChartData: any;
  chartOptions: any;
  isLoading: boolean = true;

  constructor(private httpClient: HttpClient) {} // Fix: lowercase httpClient

  ngOnInit() {
    this.ngxSpinnerService.show('actionsLoader');
    this.getStatisticsData();
  }

  getStatisticsData() {

    this.httpClient.get<any>(`${WEB_SITE_BASE_URL}dashboard_statistic`).subscribe({
      next: (res) => {
        // The response seems to be the data directly, not wrapped in a 'data' property
        this.statisticsData = res;
        console.log(this.statisticsData.pendingorders,
          this.statisticsData.confirmedorders,
          this.statisticsData.cancelledorders
        )
        // this.setDefaultData();

        // Initialize charts AFTER data is received
        this.initializeCharts();
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: (error) => {
        console.error('Error fetching statistics:', error);
        // Optionally set default data or handle error
        this.setDefaultData();
        this.initializeCharts();
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  private setDefaultData() {
    // Fallback data in case of error
    this.statisticsData = {
      users: 0,
      categories: 0,
      products: 0,
      pendingorders: 8,
      confirmedorders: 8,
      cancelledorders: 8
    };
  }

  initializeCharts() {
    // Only initialize if data exists
    if (!this.statisticsData) {
      return;
    }

    // Overview Doughnut Chart
    this.overviewChartData = {
      labels: ['Confirmed Orders', 'Cancelled Orders', 'Pending Orders'],
      datasets: [
        {
          data: [
            this.statisticsData.confirmedorders,
            this.statisticsData.cancelledorders,
            this.statisticsData.pendingorders,
          ],
          backgroundColor: [
            'green',
            'red',
            '#FF9C09',
          ],
          hoverBackgroundColor: [
            'green',
            'red',
            '#FF9C09',
          ]
        }
      ]
    };

    // Orders Status Chart
    this.ordersChartData = {
      labels: ['Pending Orders', 'Confirmed Orders', 'Cancelled Orders'],
      datasets: [
        {
          data: [
            this.statisticsData.pendingorders,
            this.statisticsData.confirmedorders,
            this.statisticsData.cancelledorders
          ],
          backgroundColor: [
            '#FFA726',
            '#66BB6A',
            '#EF5350'
          ],
          borderColor: [
            '#FF9800',
            '#4CAF50',
            '#F44336'
          ],
          borderWidth: 1
        }
      ]
    };

    // Inventory Chart
    this.inventoryChartData = {
      labels: ['Categories', 'Products'],
      datasets: [
        {
          data: [this.statisticsData.categories, this.statisticsData.products],
          backgroundColor: ['#66BB6A', '#42A5F5'],
          borderColor: ['#4CAF50', '#2196F3'],
          borderWidth: 1
        }
      ]
    };

    // Chart options
    this.chartOptions = {
      plugins: {
        legend: {
          display: true, // Ensure legend is enabled
          labels: {
            usePointStyle: true,
            color: '#495057'
          }
        }
      },
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };
  }

  getTotalOrders(): number {
    if (!this.statisticsData) {
      return 0;
    }
    return this.statisticsData.pendingorders +
           this.statisticsData.confirmedorders +
           this.statisticsData.cancelledorders;
  }
}