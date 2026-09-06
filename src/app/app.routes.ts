/**
 * @file app.routes.ts
 * @description Application routing configuration
 *
 * Defines the application's route structure including:
 * - Authentication routes with guards
 * - Dashboard layout and child routes
 * - Feature modules routing (categories, sub-categories, etc.)
 *
 * Key features:
 * - Lazy loading of components
 * - Route guards for authentication
 * - Route resolvers for data pre-fetching
 * - Meta data for SEO
 *
 * Main route groups:
 * 1. Auth routes ('/login')
 * 2. Dashboard routes ('/dashboard')
 *    - Home
 *    - Menu management
 *    - Categories
 *    - Sub-categories
 *    - Products
 *    - Sub-locations
 *    - Orders
 *    - Users
 *    - Pages
 *    - Blogs
 *    - And more...
 *
 * @exports routes - Application route configuration
 */

import { Routes } from '@angular/router';
import { authGuard } from './auth/gurd/auth.guard';
import { loginGuard } from './auth/gurd/login.guard';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
// import { subLocationsResolver } from "./core/resolvers/e-sublocations/sub-locations.resolver";
import { subCategoryDetailsResolver } from './core/resolvers/b-sub-category/sub-category-details.resolver';
import { EditProductsResolver } from './core/resolvers/edit-product/edit-product.resolver';
import { farCategoryResolver } from './core/resolvers/far-category/far-category.resolver';
import { allCategoriesResolver } from './core/resolvers/h-category/all-categories.resolver';
import { categoryDetailsResolver } from './core/resolvers/h-category/category-details.resolver';
import { promoCodesResolver } from './core/resolvers/promo-codes/promo-codes.resolver';
import { EditChoiceComponent } from './pages/dashboard/dashboard-pages/c-dashboard-menu/choices/edit-choice/edit-choice.component';
import { HomeStatisticsComponent } from './pages/dashboard/dashboard-pages/home-statistics/home-statistics.component';
import { JInternetConnectionComponent } from './pages/dashboard/dashboard-pages/j-internet-connection/j-internet-connection.component';
import { test2 } from './shared/components/test2/test2.component';
export const routes: Routes = [
  // Auth
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/components/login/login.component').then(
            (c) => c.LoginComponent
          ),
        data: {
          title: 'HAC  - login',
          description: 'Login Page',
        },
      },
    ],
  },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./core/layouts/dashboard-layout/dashboard-layout.component').then(
        (c) => c.DashboardLayoutComponent
      ),
    canActivate: [loginGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './pages/dashboard/dashboard-pages/dashboard-pages.component'
          ).then((c) => c.DashboardPagesComponent),
        data: {
          title: 'HAC ',
          description: 'Dashboard Page',
        },
        children: [
          {
            path: '',
            redirectTo: 'home-statistics',
            pathMatch: 'full',
          },
          // {
          //   path: 'a-dashboard-home',  // Changed from empty path to a named path
          //   loadComponent: () =>
          //     import(
          //       './pages/dashboard/dashboard-pages/a-dashboard-home/a-dashboard-home.component'
          //     ).then((c) => c.ADashboardHomeComponent),
          //   data: {
          //     title: 'HAC ',
          //     description: 'Dashboard Page',
          //   },
          // },
          {
            path: 'home-statistics',
            component: HomeStatisticsComponent,
          },
          {
            path: 'test2',
            component: test2,
          },
          // menu
          {
            path: 'menu',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/c-dashboard-menu/c-dashboard-menu.component'
              ).then((c) => c.CDashboardMenuComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              // categories
              {
                path: 'categories',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/c-dashboard-menu/a-categories/a-categories.component'
                  ).then((c) => c.ACategoriesComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
                children: [
                  {
                    path: '',
                    redirectTo: 'categories-index',
                    pathMatch: 'full',
                  },
                  {
                    path: 'categories-index',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/a-categories/a-all-categories/a-all-categories.component'
                      ).then((c) => c.AAllCategoriesComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                  },
                  {
                    path: 'categories-details/:id',
                    resolve: { category: categoryDetailsResolver },
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/a-categories/b-category-details/b-category-details.component'
                      ).then((c) => c.BCategoryDetailsComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                  },
                  {
                    path: 'categories-add',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/a-categories/d-category-add/d-category-add.component'
                      ).then((c) => c.DCategoryAddComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                  },
                  {
                    path: 'categories-edit/:id',
                    resolve: { category: categoryDetailsResolver },
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/a-categories/d-category-add/d-category-add.component'
                      ).then((c) => c.DCategoryAddComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                  },
                ],
              },
              // sub-categories
              {
                path: 'sub-categories',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/c-dashboard-menu/c-sub-categories/c-sub-categories.component'
                  ).then((c) => c.CSubCategoriesComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
                children: [
                  {
                    path: '',
                    redirectTo: 'sub-categories-index',
                    pathMatch: 'full',
                  },
                  {
                    path: 'sub-categories-index',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/c-sub-categories/a-all-sub-categories/a-all-sub-categories.component'
                      ).then((c) => c.AAllSubCategoriesComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                    resolve: { categories: allCategoriesResolver },
                  },
                  {
                    path: 'sub-categories-details/:id',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/c-sub-categories/b-sub-categories-details/b-sub-categories-details.component'
                      ).then((c) => c.BSubCategoriesDetailsComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                    resolve: {
                      subCategory: subCategoryDetailsResolver,
                      categories: allCategoriesResolver,
                    },
                  },
                  {
                    path: 'sub-categories-add',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/c-sub-categories/c-sub-categories-add/c-sub-categories-add.component'
                      ).then((c) => c.CSubCategoriesAddComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                    resolve: { categories: allCategoriesResolver },
                  },
                  {
                    path: 'sub-categories-edit/:id',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/c-sub-categories/c-sub-categories-add/c-sub-categories-add.component'
                      ).then((c) => c.CSubCategoriesAddComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                    resolve: {
                      subCategory: subCategoryDetailsResolver,
                      categories: allCategoriesResolver,
                    },
                  },
                ],
              },
              // products
              {
                path: 'products',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/b-products.component'
                  ).then((c) => c.BProductsComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
                children: [
                  { path: '', redirectTo: 'products-index', pathMatch: 'full' },
                  {
                    path: 'products-index',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/a-all-products/a-all-products.component'
                      )
                        .then()
                        .then((c) => c.AAllProductsComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                  },
                  {
                    path: 'view-product/:id',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/view-product/view-product.component'
                      )
                        .then()
                        .then((c) => c.ViewProductComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                  },
                  // {
                  //   path: 'products-details/:id',
                  //   resolve: { products: productDetailsResolver },
                  //   loadComponent: () =>
                  //     import(
                  //       './pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/b-products-details/b-products-details.component'
                  //     )
                  //       .then()
                  //       .then((c) => c.BProductsDetailsComponent),
                  //   data: {
                  //     title: 'HAC ',
                  //     description: 'Dashboard Page',
                  //   },
                  // },
                  // {
                  //   path: 'products-pice-price/:id',
                  //   loadComponent: () =>
                  //     import(
                  //       './pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/d-products-pice-price/d-products-pice-price.component'
                  //     )
                  //       .then()
                  //       .then((c) => c.DProductsPicePriceComponent),
                  //   data: {
                  //     title: 'HAC ',
                  //     description: 'Dashboard Page',
                  //   },
                  //   resolve: { products: productDetailsResolver },

                  //   runGuardsAndResolvers: 'always',
                  // },
                  // {
                  //   path: 'products-pice-price-add/:id',
                  //   loadComponent: () =>
                  //     import(
                  //       './pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/f-pice-price-add/f-pice-price-add.component'
                  //     )
                  //       .then()
                  //       .then((c) => c.FPicePriceAddComponent),
                  //   data: {
                  //     title: 'HAC ',
                  //     description: 'Dashboard Page',
                  //   },
                  //   resolve: { products: productDetailsResolver },
                  // },
                  // {
                  //   path: 'products-pice-price-edit/:id',
                  //   loadComponent: () =>
                  //     import(
                  //       './pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/f-pice-price-add/f-pice-price-add.component'
                  //     )
                  //       .then()
                  //       .then((c) => c.FPicePriceAddComponent),
                  //   data: {
                  //     title: 'HAC ',
                  //     description: 'Dashboard Page',
                  //   },
                  //   resolve: { products: productDetailsResolver },
                  // },
                  {
                    path: 'test',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/test-table/test-table.component'
                      )
                        .then()
                        .then((c) => c.TestTableComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                  },
                  {
                    path: 'products-choice/:id',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/choices/all-choices/all-choices.component'
                      )
                        .then()
                        .then((c) => c.ProductChoicesComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                  },
                  {
                    path: 'add-choice/:id',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/choices/add-choice/add-choice.component'
                      )
                        .then()
                        .then((c) => c.AddChoiceComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                  },

                  {
                    path: 'edit-choice/:id',
                    component: EditChoiceComponent,
                  },

                  {
                    path: 'products-add',
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/b-products-add/c-products-add.component'
                      )
                        // .then()
                        .then((c) => c.CProductsAddComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                    // resolve: { categories: productsCategoriesResolver },
                  },
                  {
                    path: 'products-edit/:id',
                    resolve: {
                      product: EditProductsResolver,
                      categories: farCategoryResolver,
                    },
                    loadComponent: () =>
                      import(
                        './pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/h-products-edit/h-products-edit.component'
                      )
                        .then()
                        .then((c) => c.CProductsEditComponent),
                    data: {
                      title: 'HAC ',
                      description: 'Dashboard Page',
                    },
                  },
                ],
              },
            ],
          },
          // sub-locations
          {
            path: 'locations',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/h-sub-locations/locations-page/locations-page.component'
              ).then((c) => c.LocationsPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              {
                path: '',
                redirectTo: 'all-locations',
                pathMatch: 'full',
              },
              {
                path: 'all-locations',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/h-sub-locations/all-loocations/all-loocations.component'
                  ).then((c) => c.AAllLocationsComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-location/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/h-sub-locations/edit-location/edit-location.component'
                  ).then((c) => c.EditLocationComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'add-location',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/h-sub-locations/add-location/add-location.component'
                  ).then((c) => c.AddLocationComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-location/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/h-sub-locations/view-location/view-location.component'
                  ).then((c) => c.ViewLocationComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          {
            path: 'promo-codes',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/promo-codes/promocodes-page/promocodes-page.component'
              ).then((c) => c.PromocodesPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              {
                path: '',
                redirectTo: 'all-promo-codes',
                pathMatch: 'full',
              },
              {
                path: 'all-promo-codes',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/promo-codes/all-promocodes/all-promocodes.component'
                  ).then((c) => c.AllPromocodesComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-promo-code/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/promo-codes/edit-promocode/edit-promocode.component'
                  ).then((c) => c.EditPromocodeComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
                resolve: {
                  products: promoCodesResolver,
                },
              },
              {
                path: 'add-promo-code',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/promo-codes/add-promocode/add-promocode.component'
                  ).then((c) => c.AddPromocodeComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
                resolve: {
                  products: promoCodesResolver,
                },
              },
              {
                path: 'view-promo-code/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/promo-codes/view-promocode/view-promocode.component'
                  ).then((c) => c.ViewPromocodeComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          {
            path: 'by-one-get-one',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/by-one-get-one/by-one-get-one.component'
              ).then((c) => c.ByOneGetOneComponent),
          },
          {
            path: 'features',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/features/features-page/features-page.component'
              ).then((c) => c.FeaturesPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              {
                path: '',
                redirectTo: 'all-features',
                pathMatch: 'full',
              },
              {
                path: 'all-features',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/features/all-features/all-features.component'
                  ).then((c) => c.AllFeaturesComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-feature/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/features/edit-feature/edit-feature.component'
                  ).then((c) => c.EditFeatureComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'add-feature',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/features/add-feature/add-feature.component'
                  ).then((c) => c.AddFeatureComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-feature/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/features/view-feature/view-feature.component'
                  ).then((c) => c.ViewFeatureComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          {
            path: 'breaks',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/breaks-and-counters/breaks/breaks-page/breaks-page.component'
              ).then((c) => c.BreaksPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              {
                path: '',
                redirectTo: 'all-breaks',
                pathMatch: 'full',
              },
              {
                path: 'all-breaks',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/breaks-and-counters/breaks/all-breaks/all-breaks.component'
                  ).then((c) => c.AllBreaksComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-break/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/breaks-and-counters/breaks/add-breaks/add-breaks.component'
                  ).then((c) => c.AddBreaksComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'add-break',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/breaks-and-counters/breaks/add-breaks/add-breaks.component'
                  ).then((c) => c.AddBreaksComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-break/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/breaks-and-counters/breaks/view-breaks/view-breaks.component'
                  ).then((c) => c.ViewBreaksComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          {
            path: 'counters',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/breaks-and-counters/counters/counters-page/counters-page.component'
              ).then((c) => c.CountersPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              {
                path: '',
                redirectTo: 'all-counters',
                pathMatch: 'full',
              },
              {
                path: 'all-counters',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/breaks-and-counters/counters/all-counters/all-counters.component'
                  ).then((c) => c.AllCountersComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-counter/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/breaks-and-counters/counters/add-counter/add-counter.component'
                  ).then((c) => c.AddCounterComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'add-counter',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/breaks-and-counters/counters/add-counter/add-counter.component'
                  ).then((c) => c.AddCounterComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-counter/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/breaks-and-counters/counters/view-counter/view-counter.component'
                  ).then((c) => c.ViewCounterComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          {
            path: 'feedbacks',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/feedback/components/feedback-page/feedback-page.component'
              ).then((c) => c.FeedbackPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              {
                path: '',
                redirectTo: 'all-feedbacks',
                pathMatch: 'full',
              },
              {
                path: 'all-feedbacks',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/feedback/components/all-feedbacks/all-feedbacks.component'
                  ).then((c) => c.AllContactFormsComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },

              {
                path: 'view-feed-back/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/feedback/components/view-feed-back/view-feed-back.component'
                  ).then((c) => c.ViewContactFormComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          // orders
          {
            path: 'new-categories',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/categories/components/categories-page/categories-page.component'
              ).then((c) => c.CategoriesPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              { path: '', redirectTo: 'all-categories', pathMatch: 'full' },
              {
                path: 'all-categories',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/categories/components/all-categories/all-categories.component'
                  ).then((c) => c.AllCategoriesComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-category/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/categories/components/view-category/view-category.component'
                  ).then((c) => c.ViewCategoryComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-category/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/categories/components/edit-categories/edit-categories.component'
                  ).then((c) => c.EditCategoriesComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'add-category',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/categories/components/edit-categories/edit-categories.component'
                  ).then((c) => c.EditCategoriesComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          // users
          {
            path: 'users',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/users/components/users-page/users-page.component'
              ).then((c) => c.UsersPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              { path: '', redirectTo: 'users-index', pathMatch: 'full' },
              {
                path: 'users-index',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/users/components/all-users/all-users.component'
                  ).then((c) => c.AllUsersComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'buisness-users',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/users/components/commercial-user/commercial-user.component'
                  ).then((c) => c.CommercialUserComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'user-orders/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/users/components/view-user-orders/view-user-orders.component'
                  ).then((c) => c.ViewUserOrdersComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },

          // blogs
          {
            path: 'blogs',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/blogs/components/blogs-page/blogs-page.component'
              ).then((c) => c.BlogsPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              { path: '', redirectTo: 'blogs-index', pathMatch: 'full' },
              {
                path: 'blogs-index',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/blogs/components/all-blogs/all-blogs.component'
                  ).then((c) => c.AAllBlogsComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-blog/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/blogs/components/view-blog/view-blog.component'
                  ).then((c) => c.ViewBlogComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'add-blog',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/blogs/components/add-blog/add-blog.component'
                  ).then((c) => c.AddBlogComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-blog/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/blogs/components/add-blog/add-blog.component'
                  ).then((c) => c.AddBlogComponent),
                data: {
                  title: 'HAC Website ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          {
            path: 'sliders',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/sliders/sliders-page/sliders-page.component'
              ).then((c) => c.SlidersPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              { path: '', redirectTo: 'sliders-index', pathMatch: 'full' },
              {
                path: 'sliders-index',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/sliders/all-sliders/all-sliders.component'
                  ).then((c) => c.AllSlidersComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-slider/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/sliders/view-slider/view-slider.component'
                  ).then((c) => c.ViewSliderComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'add-slider',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/sliders/add-slider/add-slider.component'
                  ).then((c) => c.AddSliderComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-slider/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/sliders/add-slider/add-slider.component'
                  ).then((c) => c.AddSliderComponent),
                data: {
                  title: 'HAC Website ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          {
            path: 'offers',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/offers/components/offers-page/offers-page.component'
              ).then((c) => c.OffersPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              { path: '', redirectTo: 'offers-index', pathMatch: 'full' },
              {
                path: 'offers-index',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/offers/components/all-offers/all-offers.component'
                  ).then((c) => c.AllOffersComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-offer/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/offers/components/view-offer/view-offer.component'
                  ).then((c) => c.ViewOfferComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'add-offer',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/offers/components/add-offer/add-offer.component'
                  ).then((c) => c.AddOfferComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-offer/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/offers/components/add-offer/add-offer.component'
                  ).then((c) => c.AddOfferComponent),
                data: {
                  title: 'HAC Website ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          {
            path: 'faqs',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/faq/components/faqs-page/faqs-page.component'
              ).then((c) => c.FaqsPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              { path: '', redirectTo: 'faqs-index', pathMatch: 'full' },
              {
                path: 'faqs-index',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/faq/components/all-faqs/all-faqs.component'
                  ).then((c) => c.AllFaqsComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-faq/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/faq/components/view-faqs/view-faqs.component'
                  ).then((c) => c.ViewFaqComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'add-faqs',

                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/faq/components/add-faqs/add-faqs.component'
                  ).then((c) => c.AddFaqComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-faq/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/faq/components/add-faqs/add-faqs.component'
                  ).then((c) => c.AddFaqComponent),
                data: {
                  title: 'HAC Website ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          {
            path: 'orders',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/orders/components/orders-page/orders-page.component'
              ).then((c) => c.OrdersPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              { path: '', redirectTo: 'orders-index', pathMatch: 'full' },
              {
                path: 'orders-index',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/orders/components/all-orders/all-orders.component'
                  ).then((c) => c.OrdersComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-order/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/orders/components/view-order/view-order.component'
                  ).then((c) => c.ViewOrderComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'orders-history',

                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/orders/components/order-history/order-history.component'
                  ).then((c) => c.OrderHistoryComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'tamara-orders',

                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/orders/components/tamara-orders/tamara-orders.component'
                  ).then((c) => c.TamaraOrdersComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'tamara-history',

                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/orders/components/tamara-history/tamara-history.component'
                  ).then((c) => c.TamaraHistoryComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'edit-faq/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/faq/components/add-faqs/add-faqs.component'
                  ).then((c) => c.AddFaqComponent),
                data: {
                  title: 'HAC Website ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          // special-requests
          {
            path: 'special-requests',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/special-requests/components/special-requests-page/special-requests-page.component'
              ).then((c) => c.SpecialRequestsPageComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              { path: '', redirectTo: 'all-special-requests', pathMatch: 'full' },
              {
                path: 'all-special-requests',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/special-requests/components/all-special-requests/all-special-requests.component'
                  ).then((c) => c.AllSpecialRequestsComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'view-special-request/:id',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/special-requests/components/view-special-request/view-special-request.component'
                  ).then((c) => c.ViewSpecialRequestComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              }
            ],
          },
          // pages
          {
            path: 'pages',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/f-dashboard-pages/f-dashboard-pages.component'
              ).then((c) => c.FDashboardPagesComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            children: [
              {
                path: 'about-us',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/f-dashboard-pages/a-about-us/a-about-us.component'
                  ).then((c) => c.AAboutUsComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
              {
                path: 'privacy-policy',
                loadComponent: () =>
                  import(
                    './pages/dashboard/dashboard-pages/f-dashboard-pages/b-privacy-policy/b-privacy-policy.component'
                  ).then((c) => c.BPrivacyPolicyComponent),
                data: {
                  title: 'HAC ',
                  description: 'Dashboard Page',
                },
              },
            ],
          },
          // contact-us
          {
            path: 'social-links',
            loadComponent: () =>
              import(
                './pages/dashboard/dashboard-pages/g-contact-us/social-links/social-links.component'
              ).then((c) => c.SocialLinksComponent),
            data: {
              title: 'HAC ',
              description: 'Dashboard Page',
            },
            // children: [
            //   {
            //     path: 'social-links',
            //     loadComponent: () =>
            //       import(
            //         './pages/dashboard/dashboard-pages/g-contact-us/a-social-media-links/a-social-media-links.component'
            //       ).then((c) => c.ASocialMediaLinksComponent),
            //     data: {
            //       title: 'HAC ',
            //       description: 'Dashboard Page',
            //     },
            //   },
            //   {
            //     path: 'branches',
            //     loadComponent: () =>
            //       import(
            //         './pages/dashboard/dashboard-pages/g-contact-us/b-branch/b-branch.component'
            //       ).then((c) => c.BBranchComponent),
            //     data: {
            //       title: 'HAC ',
            //       description: 'Dashboard Page',
            //     },
            //     children: [
            //       { path: '', redirectTo: 'branches-index', pathMatch: 'full' },
            //       {
            //         path: 'branches-index',
            //         loadComponent: () =>
            //           import(
            //             './pages/dashboard/dashboard-pages/g-contact-us/b-branch/c-all-branches/c-all-branches.component'
            //           ).then((c) => c.CAllBranchesComponent),
            //         data: {
            //           title: 'HAC ',
            //           description: 'Dashboard Page',
            //         },
            //       },
            //       {
            //         path: 'branches-details/:id',
            //         resolve: { branch: branchDetailsResolver },
            //         loadComponent: () =>
            //           import(
            //             './pages/dashboard/dashboard-pages/g-contact-us/b-branch/a-branch-details/a-branch-details.component'
            //           ).then((c) => c.ABranchDetailsComponent),
            //         data: {
            //           title: 'HAC ',
            //           description: 'Dashboard Page',
            //         },
            //       },
            //       {
            //         path: 'branches-add',
            //         loadComponent: () =>
            //           import(
            //             './pages/dashboard/dashboard-pages/g-contact-us/b-branch/b-branch-add/b-branch-add.component'
            //           ).then((c) => c.BBranchAddComponent),
            //         data: {
            //           title: 'HAC ',
            //           description: 'Dashboard Page',
            //         },
            //       },
            //       {
            //         path: 'branches-edit/:id',
            //         resolve: { branch: branchDetailsResolver },
            //         loadComponent: () =>
            //           import(
            //             './pages/dashboard/dashboard-pages/g-contact-us/b-branch/b-branch-add/b-branch-add.component'
            //           ).then((c) => c.BBranchAddComponent),
            //         data: {
            //           title: 'HAC ',
            //           description: 'Dashboard Page',
            //         },
            //       },
            //     ],
            //   },
            //   {
            //     path: 'messages',
            //     loadComponent: () =>
            //       import(
            //         './pages/dashboard/dashboard-pages/g-contact-us/d-messages/d-messages.component'
            //       ).then((c) => c.DMessagesComponent),
            //     data: {
            //       title: 'HAC ',
            //       description: 'Dashboard Page',
            //     },
            //   },
            //   {
            //     path: 'messages/:id',
            //     resolve: { message: messageDetailsResolver },
            //     loadComponent: () =>
            //       import(
            //         './pages/dashboard/dashboard-pages/g-contact-us/d-messages/message-details/message-details.component'
            //       ).then((c) => c.MessageDetailsComponent),
            //     data: {
            //       title: 'HAC ',
            //       description: 'Dashboard Page',
            //     },
            //   },
            // ],
          },
        ],
      },
    ],
  },

  /** path: ***/
  {
    path: 'internet-error',
    component: JInternetConnectionComponent,
  },

  // Not Found Page
  {
    path: '**',
    loadComponent: () =>
      import('./pages/main/not-found/not-found.component').then(
        (e) => e.NotFoundComponent
      ),
    data: { title: 'Not Found Page' },
  },
];
