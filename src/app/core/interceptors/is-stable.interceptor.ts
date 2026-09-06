import { isPlatformBrowser } from "@angular/common";
import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { ApplicationRef, inject, PLATFORM_ID } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { catchError, delay, finalize, first, retryWhen, scan, throwError, timeout, TimeoutError } from "rxjs";

const NO_RETRY_APIS = [
  "signup",
  "signin",
  "resetUserCode",
  "resetUserPassword",
  "updateUserPassword",
  "deleteuseraccount",
  "updateUserProfile",
];

export const networkInterceptor: HttpInterceptorFn = (req, next) => {
  const appRef = inject(ApplicationRef);
  const _PLATFORM_ID = inject(PLATFORM_ID);
  const _Router = inject(Router);
  const toastrService = inject(ToastrService);

  const shouldSkipRetry = NO_RETRY_APIS.some((endpoint) => req.url.includes(endpoint));

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 20000; // 500ms delay
  const PENDING_TIMEOUT = 40000; // 30 seconds

  return next(req).pipe(
    shouldSkipRetry
      ? catchError((error: HttpErrorResponse) => throwError(() => error))
      : retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              if (!navigator.onLine) {
                console.warn("⚠️ No internet connection detected.");
                const toastRef = toastrService.error(
                  `<div class="flex flex-col gap-2">
                    <span>No internet connection</span>
                    <div class="flex justify-center">
                      <button type="button" onclick="window.location.reload()" class="inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Page
                      </button>
                    </div>
                  </div>`,
                  "Connection Error",
                  {
                    timeOut: 0,
                    extendedTimeOut: 0,
                    closeButton: true,
                    progressBar: true,
                    enableHtml: true,
                    toastClass: 'ngx-toastr',
                    positionClass: 'toast-top-left',
                    tapToDismiss: false,
                  }
                );

                // Throw a custom error for internet connection issues
                throw new Error("NoInternetError");
              }

              // Retry logic for network-related errors
              if (
                retryCount >= MAX_RETRIES ||
                (error.status !== 0 && error.status < 500) ||
                error.status === 502 ||
                error.status === 504
              ) {
                console.error("❌ Network issue: Unable to reach the server after retries.");
                throw error; // Stop retrying after max retries or specific errors
              }

              console.warn(`Retrying request... (${retryCount + 1}/${MAX_RETRIES})`);
              return retryCount + 1;
            }, 0),
            delay(RETRY_DELAY)
          )
        ),
    catchError((error: HttpErrorResponse) => {
      // Check for the custom "NoInternetError" and navigate to the error page
      if (error.message === "NoInternetError") {
        _Router.navigate(["/internet-error"]);
      }
      return throwError(() => error);
    }),
    finalize(() => {
      if (isPlatformBrowser(_PLATFORM_ID)) {
        appRef.isStable.pipe(
          first((stable) => stable),
          timeout(10000)
        );
      }
    }),
    // Add a timeout to detect long-pending requests
    timeout(PENDING_TIMEOUT),
    catchError((error: any) => {
      if (error instanceof TimeoutError) {
        toastrService.error("The request is taking longer than expected. Please check your internet connection.");
      }
      return throwError(() => error);
    })
  );
};
