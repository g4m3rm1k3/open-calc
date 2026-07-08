import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const skip = page.getByText("Skip", { exact: true });
if (await skip.count()) { await skip.click(); await page.waitForTimeout(300); }
await page.click('button[aria-label*="tart" i], button[aria-label*="menu" i], button[aria-label*="app" i]').catch(() => {});
await page.waitForTimeout(500);
await page.fill('input[placeholder*="Search labs" i]', "HTML Lab Lessons");
await page.waitForTimeout(500);
await page.getByText("HTML Lab Lessons", { exact: true }).click();
await page.waitForTimeout(1200);
await page.getByRole("button", { name: "JavaScript", exact: true }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: /Conditionals & Loops/ }).click();
await page.waitForTimeout(2000);
for (let i = 0; i < 4; i++) {
  await page.getByRole("button", { name: /Next/ }).click();
  await page.waitForTimeout(3000);
}
await page.getByRole("button", { name: "JavaScript", exact: true }).click();
await page.waitForTimeout(300);
await page.click(".monaco-editor");
await page.keyboard.press("Escape");
await page.keyboard.press("Control+A");
const fullScript = "const display = document.getElementById('display');\nlet count = 0;\n\ndocument.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n  if (count % 2 === 0) {\n    display.style.color = '#16a34a';\n  } else {\n    display.style.color = '#0f172a';\n  }\n  if (count > 5) {\n    document.getElementById('milestone').textContent = \"You've clicked a lot!\";\n  } else {\n    document.getElementById('milestone').textContent = '';\n  }\n});\n\ndocument.getElementById('resetBtn').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n  display.style.color = '#0f172a';\n  document.getElementById('milestone').textContent = '';\n});\n\ndocument.getElementById('sumBtn').addEventListener('click', () => {\n  let total = 0;\n  for (let i = 1; i <= 5; i = i + 1) {\n    total = total + i;\n  }\n  document.getElementById('sumResult').textContent = 'Sum: ' + total;\n});\n\ndocument.getElementById('factorialBtn').addEventListener('click', () => {\n  let total = 1;\n  for (let i = 1; i <= 5; i = i + 1) {\n    total = total * i;\n  }\n  document.getElementById('factorialResult').textContent = total;\n});";
await page.keyboard.insertText(fullScript);
await page.waitForTimeout(1000);
await page.getByRole("button", { name: "Check", exact: true }).click({ timeout: 10000 });
await page.waitForTimeout(1000);
const feedback = await page.locator('[class*="lessonFeedback"]').innerText().catch(() => "(none found)");
console.log("Feedback:", feedback);
await page.screenshot({ path: "__final_result.png" });
await browser.close();
