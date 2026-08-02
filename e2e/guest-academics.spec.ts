import {expect,test} from "@playwright/test";

test.beforeEach(async({page})=>{await page.goto("/en/academics");await page.evaluate(()=>new Promise<void>((resolve,reject)=>{const request=indexedDB.deleteDatabase("academic-planner-guest");request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error);}));await page.reload();});

test("guest can create a semester and course",async({page})=>{
  await page.getByRole("button",{name:"Add semester"}).first().click();
  await page.getByLabel("Academic year").fill("2026");
  await page.getByLabel("Term number").fill("1");
  await page.getByLabel("Term name").fill("Fall 2026");
  await page.getByRole("button",{name:"Save semester"}).click();
  await expect(page.getByRole("heading",{name:"Fall 2026"})).toBeVisible();
  await page.getByRole("button",{name:"Add course"}).click();
  await page.getByLabel("Course code").fill("CS101");
  await page.getByLabel("Course name").fill("Programming Fundamentals");
  await page.getByLabel("Status").selectOption("ACTUAL");
  await page.getByRole("button",{name:"Save course"}).click();
  await expect(page.getByText("Programming Fundamentals")).toBeVisible();
  await expect(page.getByText("CS101")).toBeVisible();
});

test("login and recovery entry points are accessible",async({page})=>{await page.goto("/en/login");await expect(page.getByRole("heading",{name:"Welcome back"})).toBeVisible();await page.getByRole("button",{name:"Forgot password?"}).click();await expect(page.getByRole("heading",{name:"Recover account"})).toBeVisible();await expect(page.getByLabel("Email")).toBeVisible();});
