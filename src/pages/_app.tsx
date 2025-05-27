import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import "@radix-ui/themes/styles.css";
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Theme } from "@radix-ui/themes";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';

import { config } from '@/config/wagmi';
import { Layout } from '@/components/layout/Layout';

import { Toaster } from '@/components/ui/sonner';

const client = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Aiigo DEX</title>
        <meta name="description" content="Decentralized Exchange Platform" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <RainbowKitProvider theme={darkTheme()}>
            <Theme appearance="dark">
              <Layout>
                <Component {...pageProps} />
                <Toaster position='top-right'/>
              </Layout>
            </Theme>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default App;
