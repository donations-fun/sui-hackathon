module donate::donate;

use axelar_gateway::channel::{Self, Channel};
use axelar_gateway::gateway::{Self, Gateway};
use axelar_gateway::message_ticket::MessageTicket;
use gas_service::gas_service::GasService;
use interchain_token_service::{
    token_id::TokenId,
    interchain_token_service::{Self, InterchainTokenService},
};
use std::ascii::String;
use std::type_name;
use donate::utils::get_charity_id;
use sui::sui::SUI;
use sui::coin::Coin;
use sui::clock::Clock;
use sui::event;
use sui::table::{Self, Table};
use std::type_name::TypeName;

const VERSION: u64 = 2;

/// -----
/// Error
/// -----

const ECharityAlreadyKnownInterchain: u64 = 0;
const ECharityAlreadyKnown: u64 = 1;
const ECharityDoesNotExist: u64 = 2;
const EInvalidDestinationChain: u64 = 3;
const ENotUpgrade: u64 = 4;
const EWrongVersion: u64 = 5;

/// -----
/// Structs
/// -----
public struct TokenAnalytic has store, copy {
    token: TypeName,
    amount: u64
}

public struct KnownCharityInterchain has key, store {
    id: UID,
    destination_chain: String,
    charity_address: vector<u8>
}

public struct Singleton has key {
    id: UID,
    channel: Channel,

    // `address` type key here will actually store 32 bytes keccak256 hash
    known_charities: Table<address, address>,
    analytics_tokens: Table<TypeName, bool>,
    address_analytics: Table<address, vector<TokenAnalytic>>,
    // `address` type key here will actually store 32 bytes keccak256 hash
    known_charities_interchain: Table<address, KnownCharityInterchain>,
    version: u64,
}

public struct OwnerCap has key, store {
    id: UID,
}

/// -----
/// Events
/// -----
public struct AddKnownCharity has copy, drop {
    charity_id: address,
    charity_name: String,
    charity_address: address,
}

public struct RemoveKnownCharity has copy, drop {
    charity_id: address,
    charity_name: String,
    charity_address: address,
}

public struct AddKnownCharityInterchain has copy, drop {
    charity_id: address,
    charity_name: String,
    destination_chain: String,
    charity_address: vector<u8>,
}

public struct RemoveKnownCharityInterchain has copy, drop {
    charity_id: address,
    charity_name: String,
    destination_chain: String,
    charity_address: vector<u8>,
}

public struct AddAnalyticToken has copy, drop {
    token: TypeName,
}

public struct RemoveAnalyticToken has copy, drop {
    token: TypeName,
}

public struct Donation has copy, drop {
    user: address,
    token: TypeName,
    charity_id: address,
    charity_name: String,
    amount: u64,
}

public struct DonationInterchain has copy, drop {
    user: address,
    token: TypeName,
    charity_id: address,
    charity_name: String,
    amount: u64,
    token_id: TokenId,
    destination_chain: String,
}

/// -----
/// Setup
/// -----
fun init(ctx: &mut TxContext) {
    let singletonId = object::new(ctx);
    let channel = channel::new(ctx);

    transfer::share_object(Singleton {
        id: singletonId,
        channel,
        known_charities: table::new<address, address>(ctx),
        analytics_tokens: table::new<TypeName, bool>(ctx),
        address_analytics: table::new<address, vector<TokenAnalytic>>(ctx),
        known_charities_interchain: table::new<address, KnownCharityInterchain>(ctx),
        version: VERSION,
    });

    let owner = OwnerCap {
        id: object::new(ctx),
    };

    transfer::public_transfer(owner, ctx.sender());
}

entry fun migrate(singleton: &mut Singleton, _owner: &OwnerCap) {
    assert!(singleton.version < VERSION, ENotUpgrade);
    singleton.version = VERSION;
}

// -----
// Public Functions
// -----

public fun add_known_charity(
    singleton: &mut Singleton,
    _owner: &OwnerCap,
    charity_name: String,
    charity_address: address
) {
    assert!(singleton.version == VERSION, EWrongVersion);

    let charity_id = get_charity_id(charity_name);

    assert!(
        !singleton.known_charities_interchain.contains<address, KnownCharityInterchain>(charity_id),
        ECharityAlreadyKnownInterchain
    );

    singleton.known_charities.add(charity_id, charity_address);

    event::emit(AddKnownCharity {
        charity_id,
        charity_name,
        charity_address,
    });
}

public fun remove_known_charity(
    singleton: &mut Singleton,
    _owner: &OwnerCap,
    charity_name: String,
) {
    assert!(singleton.version == VERSION, EWrongVersion);

    let charity_id = get_charity_id(charity_name);

    let charity_address = singleton.known_charities.remove(charity_id);

    event::emit(RemoveKnownCharity {
        charity_id,
        charity_name,
        charity_address,
    });
}

public fun add_known_charity_interchain(
    singleton: &mut Singleton,
    _owner: &OwnerCap,
    charity_name: String,
    destination_chain: String,
    charity_address: vector<u8>,
    ctx: &mut TxContext
) {
    assert!(singleton.version == VERSION, EWrongVersion);

    let charity_id = get_charity_id(charity_name);

    assert!(
        !singleton.known_charities.contains<address, address>(charity_id),
        ECharityAlreadyKnown
    );

    singleton.known_charities_interchain.add(charity_id, KnownCharityInterchain {
        id: object::new(ctx),
        destination_chain,
        charity_address,
    });

    event::emit(AddKnownCharityInterchain {
        charity_id,
        charity_name,
        destination_chain,
        charity_address,
    });
}

public fun remove_known_charity_interchain(
    singleton: &mut Singleton,
    _owner: &OwnerCap,
    charity_name: String,
) {
    assert!(singleton.version == VERSION, EWrongVersion);

    let charity_id = get_charity_id(charity_name);

    let known_charity_interchain = singleton.known_charities_interchain.remove(charity_id);
    let KnownCharityInterchain { id, destination_chain, charity_address } = known_charity_interchain;

    event::emit(RemoveKnownCharityInterchain {
        charity_id,
        charity_name,
        destination_chain,
        charity_address,
    });

    id.delete();
}

public fun add_analytics_token<T>(
    singleton: &mut Singleton,
    _owner: &OwnerCap,
) {
    assert!(singleton.version == VERSION, EWrongVersion);

    let token = type_name::get<T>();

    singleton.analytics_tokens.add(token, true);

    event::emit(AddAnalyticToken {
        token,
    });
}

public fun remove_analytics_token<T>(
    singleton: &mut Singleton,
    _owner: &OwnerCap,
) {
    assert!(singleton.version == VERSION, EWrongVersion);

    let token = type_name::get<T>();

    singleton.analytics_tokens.remove(token);

    event::emit(RemoveAnalyticToken {
        token,
    });
}

public fun donate<T>(
    singleton: &mut Singleton,
    charity_name: String,
    coin: Coin<T>,
    ctx: &mut TxContext,
) {
    assert!(singleton.version == VERSION, EWrongVersion);

    let charity_id = get_charity_id(charity_name);
    let user = ctx.sender();

    let charity_address = donate_raw<T>(singleton, user, charity_id, &coin);

    event::emit(Donation {
        user,
        token: type_name::get<T>(),
        charity_id,
        charity_name,
        amount: coin.value(),
    });

    transfer::public_transfer(coin, charity_address);
}

public fun donate_interchain<T>(
    singleton: &mut Singleton,
    its: &mut InterchainTokenService,
    gateway: &mut Gateway,
    gas_service: &mut GasService,
    charity_name: String,
    coin: Coin<T>,
    token_id: TokenId,
    destination_chain: String,
    gas: Coin<SUI>,
    clock: &Clock, // instance available at address 0x6
    ctx: &mut TxContext,
) {
    assert!(singleton.version == VERSION, EWrongVersion);

    let charity_id = get_charity_id(charity_name);
    let user = ctx.sender();

    let charity_address = donate_interchain_raw<T>(singleton, user, charity_id, &coin, destination_chain);

    event::emit(DonationInterchain {
        user,
        token: type_name::get<T>(),
        charity_id,
        charity_name,
        amount: coin.value(),
        token_id,
        destination_chain,
    });

    let interchain_transfer_ticket = interchain_token_service::prepare_interchain_transfer<T>(
        token_id,
        coin,
        destination_chain,
        charity_address,
        vector[],
        &singleton.channel,
    );

    let message_ticket = its.send_interchain_transfer<T>(
        interchain_transfer_ticket,
        clock,
    );

    pay_gas_and_send_message(
        gateway,
        gas_service,
        gas,
        message_ticket,
        user,
        vector[],
    );
}

// -----
// Private Functions
// -----

fun donate_raw<T>(
    singleton: &mut Singleton,
    user: address,
    charity_id: address,
    coin: &Coin<T>,
): address {
    assert!(singleton.version == VERSION, EWrongVersion);

    assert!(singleton.known_charities.contains(charity_id), ECharityDoesNotExist);

    handle_analytics<T>(singleton, user, coin);

    *singleton.known_charities.borrow(charity_id)
}

fun donate_interchain_raw<T>(
    singleton: &mut Singleton,
    user: address,
    charity_id: address,
    coin: &Coin<T>,
    destination_chain: String,
): vector<u8> {
    assert!(singleton.version == VERSION, EWrongVersion);

    assert!(singleton.known_charities_interchain.contains(charity_id), ECharityDoesNotExist);

    handle_analytics<T>(singleton, user, coin);

    let known_charity_interchain: &KnownCharityInterchain = singleton.known_charities_interchain.borrow(charity_id);

    assert!(known_charity_interchain.destination_chain == destination_chain, EInvalidDestinationChain);

    known_charity_interchain.charity_address
}

fun handle_analytics<T>(
    singleton: &mut Singleton,
    user: address,
    coin: &Coin<T>
) {
    assert!(singleton.version == VERSION, EWrongVersion);

    let token_type = type_name::get<T>();
    if (user == @0x0 || !singleton.analytics_tokens.contains(token_type)) {
        return
    };

    if (!singleton.address_analytics.contains(user)) {
        singleton.address_analytics.add(user, vector[]);
    };

    let analytics: &mut vector<TokenAnalytic> = singleton.address_analytics.borrow_mut(user);

    let length = analytics.length();
    let mut i = 0;
    let mut token_found = false;
    while (i < length) {
        let elem: &mut TokenAnalytic = analytics.borrow_mut(i);
        if (elem.token == token_type) {
            elem.amount = elem.amount + coin.value();
            token_found = true;
            break
        };

        i = i + 1;
    };

    if (!token_found) {
        analytics.push_back(TokenAnalytic {
            token: token_type,
            amount: coin.value(),
        });
    }
}

/// -----
/// Internal Functions
/// -----
fun pay_gas_and_send_message(
    gateway: &Gateway,
    gas_service: &mut GasService,
    gas: Coin<SUI>,
    message_ticket: MessageTicket,
    refund_address: address,
    gas_params: vector<u8>,
) {
    gas_service.pay_gas(
        &message_ticket,
        gas,
        refund_address,
        gas_params,
    );

    gateway::send_message(gateway, message_ticket);
}

// -----
// Tests
// -----
/// ITS Hub test chain name
#[test_only]
const ITS_HUB_CHAIN_NAME: vector<u8> = b"axelar";

/// ITS hub test address
#[test_only]
const ITS_HUB_ADDRESS: vector<u8> = b"hub_address";

#[test_only]
use sui::coin;
#[test_only]
use sui::test_scenario;
#[test_only]
use sui::test_utils::assert_eq;
#[test_only]
use std::ascii;

#[test]
fun test_module_init() {
    let owner = @0xAD;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton_id = test_scenario::most_recent_id_shared<Singleton>();
        assert!(singleton_id.is_some(), 1);

        let singleton: Singleton = scenario.take_shared_by_id(singleton_id.extract());

        assert!(singleton.known_charities.is_empty());
        assert!(singleton.analytics_tokens.is_empty());
        assert!(singleton.address_analytics.is_empty());

        test_scenario::return_shared(singleton);

        let owner = scenario.take_from_sender<OwnerCap>();
        scenario.return_to_sender(owner);
    };
    scenario.end();
}

#[test]
fun test_add_known_charity() {
    let owner = @0xAD;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_known_charity(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity"),
            @0xFC
        );

        assert_eq(singleton.known_charities.length(), 1);

        let expected_charity_id = @0x9215cd3334defa4b7703700cde37f071f5a64bb5831bd254d8366e40c8ce86d0;
        let charity_address = singleton.known_charities.borrow(expected_charity_id);

        let expected_address = @0xFC;

        assert_eq(*charity_address, expected_address);

        assert_eq(event::num_events(), 1);
        assert_eq(event::events_by_type<AddKnownCharity>()[0], AddKnownCharity {
            charity_id: expected_charity_id,
            charity_name: ascii::string(b"first-charity"),
            charity_address: expected_address,
        });

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };
    scenario.end();
}

#[test]
#[expected_failure(abort_code = ECharityAlreadyKnownInterchain)]
fun test_add_known_charity_error() {
    let owner = @0xAD;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_known_charity_interchain(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity"),
            ascii::string(b"destinationChain"),
            vector[0],
            scenario.ctx()
        );

        add_known_charity(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity"),
            @0xFC
        );

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };
    scenario.end();
}

#[test]
fun test_remove_known_charity() {
    let owner = @0xAD;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_known_charity(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity"),
            @0xFC
        );

        assert_eq(singleton.known_charities.length(), 1);

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        remove_known_charity(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity")
        );

        assert_eq(singleton.known_charities.length(), 0);

        let expected_charity_id = @0x9215cd3334defa4b7703700cde37f071f5a64bb5831bd254d8366e40c8ce86d0;
        let expected_address = @0xFC;

        assert_eq(event::num_events(), 1);
        assert_eq(event::events_by_type<RemoveKnownCharity>()[0], RemoveKnownCharity {
            charity_id: expected_charity_id,
            charity_name: ascii::string(b"first-charity"),
            charity_address: expected_address,
        });

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };
    scenario.end();
}


#[test]
fun test_add_known_charity_interchain() {
    let owner = @0xAD;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_known_charity_interchain(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity"),
            ascii::string(b"other-chain"),
            vector[0],
            scenario.ctx()
        );

        assert_eq(singleton.known_charities_interchain.length(), 1);

        let expected_charity_id = @0x9215cd3334defa4b7703700cde37f071f5a64bb5831bd254d8366e40c8ce86d0;
        let charity: &KnownCharityInterchain = singleton.known_charities_interchain.borrow(expected_charity_id);

        let expected_address = vector[0];

        assert_eq(charity.charity_address, expected_address);
        assert_eq(charity.destination_chain, ascii::string(b"other-chain"));

        assert_eq(event::num_events(), 1);
        assert_eq(event::events_by_type<AddKnownCharityInterchain>()[0], AddKnownCharityInterchain {
            charity_id: expected_charity_id,
            charity_name: ascii::string(b"first-charity"),
            destination_chain: ascii::string(b"other-chain"),
            charity_address: expected_address,
        });

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };
    scenario.end();
}

#[test]
#[expected_failure(abort_code = ECharityAlreadyKnown)]
fun test_add_known_charity_interchain_error() {
    let owner = @0xAD;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_known_charity(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity"),
            @0xFC
        );

        add_known_charity_interchain(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity"),
            ascii::string(b"destinationChain"),
            vector[0],
            scenario.ctx()
        );

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };
    scenario.end();
}

#[test]
fun test_remove_known_charity_interchain() {
    let owner = @0xAD;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_known_charity_interchain(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity"),
            ascii::string(b"other-chain"),
            vector[0],
            scenario.ctx()
        );

        assert_eq(singleton.known_charities_interchain.length(), 1);

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        remove_known_charity_interchain(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity")
        );

        assert_eq(singleton.known_charities_interchain.length(), 0);

        let expected_charity_id = @0x9215cd3334defa4b7703700cde37f071f5a64bb5831bd254d8366e40c8ce86d0;
        let expected_address = vector[0];

        assert_eq(event::num_events(), 1);
        assert_eq(event::events_by_type<RemoveKnownCharityInterchain>()[0], RemoveKnownCharityInterchain {
            charity_id: expected_charity_id,
            charity_name: ascii::string(b"first-charity"),
            destination_chain: ascii::string(b"other-chain"),
            charity_address: expected_address,
        });

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };
    scenario.end();
}

#[test]
fun test_add_analytics_token() {
    let owner = @0xAD;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_analytics_token<SUI>(
            &mut singleton,
            &owner,
        );

        let sui_type = type_name::get<SUI>();

        assert_eq(singleton.analytics_tokens.length(), 1);
        assert_eq(singleton.analytics_tokens.contains(sui_type), true);

        assert_eq(event::num_events(), 1);
        assert_eq(event::events_by_type<AddAnalyticToken>()[0], AddAnalyticToken {
            token: sui_type,
        });

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };
    scenario.end();
}

#[test]
fun test_remove_analytics_token() {
    let owner = @0xAD;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_analytics_token<SUI>(
            &mut singleton,
            &owner,
        );

        assert_eq(singleton.analytics_tokens.length(), 1);

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        remove_analytics_token<SUI>(
            &mut singleton,
            &owner,
        );

        assert_eq(singleton.analytics_tokens.length(), 0);

        let sui_type = type_name::get<SUI>();

        assert_eq(event::num_events(), 1);
        assert_eq(event::events_by_type<RemoveAnalyticToken>()[0], RemoveAnalyticToken {
            token: sui_type,
        });

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };
    scenario.end();
}

#[test]
fun test_donate() {
    let owner = @0xAD;
    let user = @0xAA;
    let charity_address = @0xFC;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_known_charity(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity"),
            charity_address
        );

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };

    scenario.next_tx(user);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();

        let coin = coin::mint_for_testing<SUI>(100, scenario.ctx());

        donate<SUI>(
            &mut singleton,
            ascii::string(b"first-charity"),
            coin,
            scenario.ctx()
        );

        assert_eq(event::num_events(), 1);
        assert_eq(event::events_by_type<Donation>()[0], Donation {
            user,
            token: type_name::get<SUI>(),
            charity_id: @0x9215cd3334defa4b7703700cde37f071f5a64bb5831bd254d8366e40c8ce86d0,
            charity_name: ascii::string(b"first-charity"),
            amount: 100,
        });

        assert_eq(singleton.address_analytics.length(), 0);

        test_scenario::return_shared(singleton);
    };

    // Charity got initial coin
    scenario.next_tx(charity_address);
    {
        let coin = scenario.take_from_sender<Coin<SUI>>();

        assert_eq(coin.value(), 100);

        scenario.return_to_sender(coin);
    };

    scenario.end();
}

#[test]
fun test_donate_with_analytics() {
    let owner = @0xAD;
    let user = @0xAA;
    let charity_address = @0xFC;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_known_charity(
            &mut singleton,
            &owner,
            ascii::string(b"first-charity"),
            charity_address
        );
        add_analytics_token<SUI>(
            &mut singleton,
            &owner,
        );

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };

    scenario.next_tx(user);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();

        let coin = coin::mint_for_testing<SUI>(100, scenario.ctx());

        donate<SUI>(
            &mut singleton,
            ascii::string(b"first-charity"),
            coin,
            scenario.ctx()
        );

        assert_eq(event::num_events(), 1);
        assert_eq(event::events_by_type<Donation>()[0], Donation {
            user,
            token: type_name::get<SUI>(),
            charity_id: @0x9215cd3334defa4b7703700cde37f071f5a64bb5831bd254d8366e40c8ce86d0,
            charity_name: ascii::string(b"first-charity"),
            amount: 100,
        });

        assert_eq(singleton.address_analytics.length(), 1);
        let analytics = singleton.address_analytics.borrow(user);
        assert_eq(analytics.length(), 1);

        let first_analytic: &TokenAnalytic = analytics.borrow(0);
        assert_eq(first_analytic.token, type_name::get<SUI>());
        assert_eq(first_analytic.amount, 100);

        test_scenario::return_shared(singleton);
    };

    // Charity got initial coin
    scenario.next_tx(charity_address);
    {
        let coin = scenario.take_from_sender<Coin<SUI>>();

        assert_eq(coin.value(), 100);

        scenario.return_to_sender(coin);
    };

    scenario.next_tx(user);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();

        let coin = coin::mint_for_testing<SUI>(50, scenario.ctx());

        donate<SUI>(
            &mut singleton,
            ascii::string(b"first-charity"),
            coin,
            scenario.ctx()
        );

        assert_eq(singleton.address_analytics.length(), 1);
        let analytics = singleton.address_analytics.borrow(user);
        assert_eq(analytics.length(), 1);

        let first_analytic: &TokenAnalytic = analytics.borrow(0);
        assert_eq(first_analytic.token, type_name::get<SUI>());
        assert_eq(first_analytic.amount, 150);

        test_scenario::return_shared(singleton);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = ECharityDoesNotExist)]
fun test_donate_charity_error() {
    let owner = @0xAD;
    let user = @0xAA;

    let mut scenario = test_scenario::begin(owner);
    {
        init(scenario.ctx());
    };

    scenario.next_tx(user);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();

        let coin = coin::mint_for_testing<SUI>(50, scenario.ctx());

        donate<SUI>(
            &mut singleton,
            ascii::string(b"first-charity"),
            coin,
            scenario.ctx()
        );

        test_scenario::return_shared(singleton);
    };

    scenario.end();
}
