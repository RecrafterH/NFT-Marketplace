import Header from "@/components/Header";
import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import Head from "next/head";
import Footer from "@/components/Footer";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/41903/nftmarketplace/v0.0.1",
});

export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="NFT Marketplace" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <ApolloProvider client={client}>
          <ChakraProvider>
            <NotificationProvider>
              <Header />
              <Component {...pageProps} />
              <Footer />
            </NotificationProvider>
          </ChakraProvider>
        </ApolloProvider>
      </MoralisProvider>
    </div>
  );
}
