module test_coins::buck;

use sui::coin::Self;
use sui::url;

public struct BUCK has drop {}

fun init(witness: BUCK, ctx: &mut TxContext) {
    let (mut treasury, metadata) = coin::create_currency(
        witness,
        9,
        b"BUCK",
        b"Bucket USD",
        b"[TEST] the stablecoin minted through bucketprotocol.io",
        option::some(url::new_unsafe_from_bytes(b"https://ipfs.io/ipfs/QmYH4seo7K9CiFqHGDmhbZmzewHEapAhN9aqLRA7af2vMW")),
        ctx,
    );
    transfer::public_freeze_object(metadata);

    let amount = 10_000_000_000_000;
    let coin = coin::mint<BUCK>(&mut treasury, amount, ctx); // mint 10k coins
    transfer::public_transfer(coin, ctx.sender());

    transfer::public_transfer(treasury, ctx.sender());
}
