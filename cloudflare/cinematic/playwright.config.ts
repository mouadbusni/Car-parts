import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  timeout:30000,
  fullyParallel:false,
  retries:1,
  workers:1,
  reporter:'line',
  use:{baseURL:'https://autopro-cinematic-preview.mouadbusni.workers.dev',trace:'on-first-retry'},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},
    {name:'mobile',use:{...devices['Pixel 5'],viewport:{width:390,height:844}}},
  ],
});
