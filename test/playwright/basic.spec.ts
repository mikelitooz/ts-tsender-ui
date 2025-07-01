import basicSetup from '../wallet-setup/basic.setup'
import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import { chai } from 'vitest'

const test = testWithSynpress(metaMaskFixtures(basicSetup))

const { expect } = test


test('has title', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Tsender/);
});

test("should show the airdropform when connected, otherwise, not", async ({ page, context, metamaskPage, extensionId }) => {
  await page.goto('/')
  await expect(page.getByText('Connect Wallet')).toBeVisible();

  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)
  await page.getByTestId('rk-connect-button').click()
  await page.getByTestId('rk-wallect-option-io.metamask').waitFor({
    state: 'visible',
    timeout: 30000 // 30 seconds
  })
  await page.getByTestId('rk-wallect-option-io.metamask').click()
  await metamask.connectToDapp()

  const customNetwork = {
    name: 'Anvil',
    rpcUrls: 'http://localhost:8545',
    chainId: 31337,
    symbol: 'ETH',
  }
  await metamask.addNetwork(customNetwork)

  await expect(page.getByTestId('Token Address')).toBeVisible();
})
