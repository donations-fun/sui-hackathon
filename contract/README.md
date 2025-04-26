# Donations.fun Sui Contract

Publish package: `sui client publish --gas-budget 100000000`

Upgrade package: `sui client upgrade --upgrade-capability 0xe3b41553eb2e0fdbf7844632801a90ce51648a48bb6a895b4e5aeb72a5850ff0`

## Testnet

### Addresses
PackageId: `0xbfe962bec4f526144de2ce6f90a019048aba11d275f4b392fe75a428f86f5c69`

Singleton Object: `0x0dfe6072aec2072ec6e2807a25b622b92bf8c79e8e0106f1fba6c1ec27340bb5`

OwnerCap: `0x6ad34246bc237deb35a3dfef40fbbe00e8484bc2ed60d4ffb656c0c3a8d37f05`

UpgradeCap: `0xe3b41553eb2e0fdbf7844632801a90ce51648a48bb6a895b4e5aeb72a5850ff0`

### Axelar ITS

IDs taken from https://github.com/axelarnetwork/axelar-contract-deployments/blob/feat/devnet-amplifier-sui-2/axelar-chains-config/info/devnet-amplifier.json#L805

InterchainTokenService Object: `0x127e4f0e8fdad2e50d9ad16a977d8472fb4d206271a6e219a803e136ff143b46`

Gateway Object: `0xb4ab8da228ae631476172849f05f71a99ef4bfd50cf682ec61fb027fc0123b2f`

Gas Service Object: `0xffd87a3b283764aad9197a0d0d5880c9085c68a5d055cfe9bac65298dd7f4cfc`

SUI TokenId (after deployment using commands below): `0xad04de873f6b5728c0486945fa730703a82454d8a9df7c2c1db89a5246c06d87`

### Add Known Charity

```
sui client call \
    --package 0xbfe962bec4f526144de2ce6f90a019048aba11d275f4b392fe75a428f86f5c69 \
    --module donate \
    --function add_known_charity \
    --args 0x0dfe6072aec2072ec6e2807a25b622b92bf8c79e8e0106f1fba6c1ec27340bb5 0x6ad34246bc237deb35a3dfef40fbbe00e8484bc2ed60d4ffb656c0c3a8d37f05 \
    "Greenpeace" 0x6a332dbe6b92ae0c6983a9d71759bfeb44af892baad518bfccf8668b4c17bb0b
```

### Add Known Charity Interchain

```
sui client call \
    --package 0xbfe962bec4f526144de2ce6f90a019048aba11d275f4b392fe75a428f86f5c69 \
    --module donate \
    --function add_known_charity_interchain \
    --args 0x0dfe6072aec2072ec6e2807a25b622b92bf8c79e8e0106f1fba6c1ec27340bb5 0x6ad34246bc237deb35a3dfef40fbbe00e8484bc2ed60d4ffb656c0c3a8d37f05 \
    "Internet Archive" "eth-sepolia" 0x1B40ed3d89fd40f875bF62A0ce79f562714d011E
```

```
sui client call \
    --package 0xbfe962bec4f526144de2ce6f90a019048aba11d275f4b392fe75a428f86f5c69 \
    --module donate \
    --function add_known_charity_interchain \
    --args 0x0dfe6072aec2072ec6e2807a25b622b92bf8c79e8e0106f1fba6c1ec27340bb5 0x6ad34246bc237deb35a3dfef40fbbe00e8484bc2ed60d4ffb656c0c3a8d37f05 \
    "Save the Children" "eth-sepolia" 0x4aAb2278a1325cFdbDF389e0664D100c74B95cf5
```

```
sui client call \
    --package 0xbfe962bec4f526144de2ce6f90a019048aba11d275f4b392fe75a428f86f5c69 \
    --module donate \
    --function add_known_charity_interchain \
    --args 0x0dfe6072aec2072ec6e2807a25b622b92bf8c79e8e0106f1fba6c1ec27340bb5 0x6ad34246bc237deb35a3dfef40fbbe00e8484bc2ed60d4ffb656c0c3a8d37f05 \
    " Heifer International" "avalanche-fuji" 0xb30cb3b3E03A508Db2A0a3e07BA1297b47bb0fb1
```

### Add Analytic Token

```
sui client call \
    --package 0xbfe962bec4f526144de2ce6f90a019048aba11d275f4b392fe75a428f86f5c69 \
    --module donate \
    --function add_analytics_token \
    --args 0x0dfe6072aec2072ec6e2807a25b622b92bf8c79e8e0106f1fba6c1ec27340bb5 0x6ad34246bc237deb35a3dfef40fbbe00e8484bc2ed60d4ffb656c0c3a8d37f05 \
    --type-args "0x2::sui::SUI"
```

### Donate

```
# Donate 0.01 SUI
sui client ptb \
    --split-coins gas [10000000] \
    --assign new_coin \
    --move-call "0xbfe962bec4f526144de2ce6f90a019048aba11d275f4b392fe75a428f86f5c69::donate::donate" \
    "<0x2::sui::SUI>" \
    @0x0dfe6072aec2072ec6e2807a25b622b92bf8c79e8e0106f1fba6c1ec27340bb5 \
    '"Greenpeace"' new_coin \
    --gas-budget 1000000000
```

### Donate Interchain

```
# Donate 0.05 SUI, pay 0.04 SUI cross chain gas
sui client ptb \
    --split-coins gas [50000000, 40000000] \
    --assign new_coin \
    --move-call "0x361b728d45c287afadf388ed69c234678022940db880e4b4a2ba5ad09b348a2f::token_id::from_address" \
    @0xad04de873f6b5728c0486945fa730703a82454d8a9df7c2c1db89a5246c06d87 \
    --assign token_id \
    --move-call "0xbfe962bec4f526144de2ce6f90a019048aba11d275f4b392fe75a428f86f5c69::donate::donate_interchain" \
    "<0x2::sui::SUI>" \
    @0x0dfe6072aec2072ec6e2807a25b622b92bf8c79e8e0106f1fba6c1ec27340bb5 \
    @0x127e4f0e8fdad2e50d9ad16a977d8472fb4d206271a6e219a803e136ff143b46 \
    @0xb4ab8da228ae631476172849f05f71a99ef4bfd50cf682ec61fb027fc0123b2f \
    @0xffd87a3b283764aad9197a0d0d5880c9085c68a5d055cfe9bac65298dd7f4cfc \
    '"Internet Archive"' new_coin.0 token_id "'eth-sepolia'" new_coin.1 @0x6 \
    --gas-budget 1000000000
```

### Axelar ITS Register Coin

- calls https://github.com/axelarnetwork/axelar-cgp-sui/blob/main/move/interchain_token_service/sources/interchain_token_service.move#L107
```
sui client ptb \
    --move-call "0x361b728d45c287afadf388ed69c234678022940db880e4b4a2ba5ad09b348a2f::coin_info::from_info" \
    "<0x2::sui::SUI>" \
    "'Sui'" "'SUI'" 9 \
    --assign coin_info \
    --move-call "0x361b728d45c287afadf388ed69c234678022940db880e4b4a2ba5ad09b348a2f::coin_management::new_locked" \
    "<0x2::sui::SUI>" \
    --assign coin_management \
    --move-call "0x361b728d45c287afadf388ed69c234678022940db880e4b4a2ba5ad09b348a2f::interchain_token_service::register_coin" \
    "<0x2::sui::SUI>" \
    @0x127e4f0e8fdad2e50d9ad16a977d8472fb4d206271a6e219a803e136ff143b46 \
    coin_info \
    coin_management
```

- calls https://github.com/axelarnetwork/axelar-cgp-sui/blob/main/move/example/sources/its/its.move#L159C16-L159C46
```
# Pay 0.04 SUI cross chain gas
sui client ptb \
    --split-coins gas [40000000] \
    --assign new_coin \
    --move-call "0x361b728d45c287afadf388ed69c234678022940db880e4b4a2ba5ad09b348a2f::token_id::from_address" \
    @0xad04de873f6b5728c0486945fa730703a82454d8a9df7c2c1db89a5246c06d87 \
    --assign token_id \
    --move-call "0x481f5417b6b34ec378d4d922808651a7cc0be9e317c40b4b22b8a85a8e46df85::its::deploy_remote_interchain_token" \
    "<0x2::sui::SUI>" \
    @0x127e4f0e8fdad2e50d9ad16a977d8472fb4d206271a6e219a803e136ff143b46 \
    @0xb4ab8da228ae631476172849f05f71a99ef4bfd50cf682ec61fb027fc0123b2f \
    @0xffd87a3b283764aad9197a0d0d5880c9085c68a5d055cfe9bac65298dd7f4cfc \
    "'eth-sepolia'" \
    token_id \
    new_coin \
    "''" \
    @0x17450a2aaef18ed9b40453d2b86c6002bb957c54a42345b03c124068af03104b
```
