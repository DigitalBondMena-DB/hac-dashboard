import { TemplateRef } from "@angular/core";

export interface TableConfig<T> {
    dataSources: {
      main: {
        service: any; // Service for main data (e.g., ProductsService)
        method: string; // Method to call (e.g., 'getAllProducts')
        responseKey?: string; // Key to extract data (e.g., 'rows')
      };
      additional?: {
        [key: string]: {
          service: any; // Service for additional data (e.g., CategoriesService)
          method: string; // Method to call (e.g., 'getAllCategories')
          responseKey?: string; // Key to extract data (e.g., 'data')
        };
      }; // Additional APIs (e.g., for categories, subcategories)
    };
    columns: ColumnConfig<T>[];
    filters?: FilterConfig[];
    globalSearch?: {
      fields: string[]; // Fields to search
    };
    pagination?: {
      rowsPerPage: number;
      rowsPerPageOptions: number[];
    };
    actions?: ActionConfig<T>[];
  }
  
  export interface ColumnConfig<T> {
    field: keyof T | string; // Field name or nested path
    header: string; // Column header
    sortable?: boolean;
    filterable?: boolean;
    filterConfig?: {
      type: 'dropdown' | 'text';
      options?: { value: any; label: string }[];
      apiKey?: string; // Reference to additional data source (e.g., 'categories' or 'subcategories')
    };
    renderType: 'text' | 'image' | 'switch' | 'button' | 'custom';
    renderOptions?: {
      imageUrlPrefix?: string;
      switchAction?: { service: any; enableMethod: string; disableMethod: string };
      buttonIcon?: string;
      buttonRoute?: string | ((row: T) => string);
      customTemplate?: TemplateRef<any>;
    };
  }
  
  export interface FilterConfig {
    field: string; // Field to filter
    type: 'dropdown' | 'text';
    placeholder: string;
    options?: { value: any; label: string }[];
    apiKey?: string; // Reference to additional data source
  }
  
  export interface ActionConfig<T> {
    label: string;
    icon: string;
    route?: string | ((row: T) => string);
    condition?: (row: T) => boolean;
  }