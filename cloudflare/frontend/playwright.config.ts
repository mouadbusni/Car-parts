import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  testMatch:'site.spec.ts',
  timeout:30000,
  fullyParallel:false,
  retries:1,
  workers:1,
  reporter:'line',
  use:{
    baseURL:process.env.AUTOPRO_BASE_URL || 'http://127.0.0.1:4177',
    trace:'on-first-retry'
  },
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},
    {name:'mobile',use:{...devices['Pixel 5'],viewport:{width:390,height:844}}}
  ]
});
