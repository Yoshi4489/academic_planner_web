import {expect,test} from "@playwright/test";

test("compact navigation works on mobile",async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto("/en");await page.getByRole("button",{name:"Open menu"}).click();await page.getByRole("link",{name:"Academics"}).click();await expect(page).toHaveURL(/\/en\/academics$/);await expect(page.getByRole("heading",{name:"Semesters & courses"})).toBeVisible();});

test("theme choice persists across navigation and reload",async({page})=>{await page.goto("/en");await page.evaluate(()=>localStorage.setItem("theme","light"));await page.reload();await expect(page.locator("html")).toHaveAttribute("data-theme","light");await page.getByRole("button",{name:"Toggle theme"}).click();await expect(page.locator("html")).toHaveAttribute("data-theme","dark");await page.reload();await expect(page.locator("html")).toHaveAttribute("data-theme","dark");});
