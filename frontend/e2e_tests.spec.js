import { test, expect } from '@playwright/test';

test.describe('eZion ERP - Testes End-to-End das Telas', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    test.setTimeout(60000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('01 - Página inicial deve redirecionar para login', async () => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveURL(/.*login/);
  });

  test('02 - Login com credenciais válidas', async () => {
    await page.goto('http://localhost:3000/login');

    // Verificar elementos da página de login
    await expect(page.locator('h2')).toContainText('Acesso ao Sistema');

    // Preencher formulário
    await page.selectOption('select[id="empresa"]', '1');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'admin');

    // Clicar em login
    await page.click('button[type="submit"]');

    // Deve redirecionar para dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  async function login(page) {
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('select[id="empresa"]');
    await page.selectOption('select[id="empresa"]', '1');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  }
});