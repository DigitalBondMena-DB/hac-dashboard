/**
 * @file app.config.server.ts
 * @description Server-side configuration for Angular Universal
 *
 * This file provides server-specific configuration by:
 * - Merging server-specific providers with the main application config
 * - Setting up server-side rendering capabilities
 *
 * @exports config - Merged server and application configuration
 */

import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
