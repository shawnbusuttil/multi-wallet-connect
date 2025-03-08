# Multi Wallet Connect

## Technologies Used

### Ethereum

The app uses `RainbowKit` and `wagmi` to deal with Ethereum wallet functions. I wanted something to cut down production time given the deadline given, so hence why RainbowKit. It is also compatible with the SWR paradigm.

_Issues:_ Metamask seems to reset to the Ethereum mainnet on reload so the last connected chain is stored in local storage so auto connect remembers.

_Recommended Wallets:_ Metamask, Phantom

### Solana

It was my first time working with Solana so I needed to do some research here. I used `wallet-adapter` and `web3.js` for most of the wallet related functions.

Issues:

- Helius was used to get the balance as the `web3.js` method was running into rate limit issues.

- Solflare is throwing an error when the wallet is connected and refreshed so it doesn't work as reliably. It is recommended to use Phantom.

_Recommended Wallets:_ Phantom

### Bitcoin

I used the `sats-connect` library that the XVerse wallet uses to do operations on the Bitcoin wallet. I found it to be very easy to work with.

_Recommended Wallets:_ XVerse

## Token Listings

LI.FI API was used for both EVM and SOL wallets. Bitcoin was excluded as to my knowledge, the API doesn't support it. But also because there are no tokens on BTC unless we were going to support ordinal token balances.

## Token Balances

Alchemy was used to get EVM based token balances because it provides a fast and efficient API. Using wagmi, you would have to know the contract address of each token and query each one.

Helius was used to get Solana based token balances. This is due to Alchemy having limited support for Solana and Helius being more performant than web3.js.

Bitcoin is excluded as the wallet only supports BTC so it saves us from making requests for token balances.

## API Requests

API is using react query for quicker hydration and simplified loading and error states. A stale time was used on the token list as it isn't expected to be updated that often. Balances can update more frequently, however. The differentiator in query is the chain ID.

## Wallet Connector

There is a `Connector.tsx` component to represent each wallet. It shows connected and disconnected states. A connected wallet should light up, showing itself as active as well as optionally display the icon of the wallet it is using.

## Assumptions

- Ethereum, Polygon, Base or Sepolia are the supported chains for the EVM wallet. Sepolia is not supported by LI.FI and so it is a great way to test for the error state when loading tokens.

- All token balances are those which are fungible (no NFTs).

- Bitcoin takes into account BTC only, no ordinals.

- If you are using Phantom for both Ethereum and Solana, you will fail to reconnect to Solana automatically on reload. I don't know if this happens with any other wallet.

## Other Challenges and Improvements

- Unit tests are not perfect and need some improvements, notably Solana.
- Bitcoin doesn't have auto-connect on reload.
- Solana doesn't work as well with Solflare as it does with Phantom.
