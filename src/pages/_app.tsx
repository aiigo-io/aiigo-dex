import '../styles/globals.css';
import "@radix-ui/themes/styles.css";
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Theme } from "@radix-ui/themes";

import { QueryClient } from '@tanstack/react-query';
import { AppKitProvider } from '@/providers/AppKitProvider';

import { Layout } from '@/components/layout/Layout';

import { Toaster } from '@/components/ui/sonner';

import { config as wagmiConfig } from '@/config/wagmi';

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
      <AppKitProvider>
        <Theme appearance="dark">
            <Layout>
              <Component {...pageProps} />
              <Toaster position='top-right'/>
            </Layout>
          </Theme>
      </AppKitProvider>
    </>
  );
}

export default App;
