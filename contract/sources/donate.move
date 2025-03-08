module donate::donate;

use std::ascii::String;
use std::type_name;
use donate::utils::get_charity_id;
use sui::coin::Coin;
use sui::event;
use sui::table::{Self, Table};
use std::type_name::TypeName;

const VERSION: u64 = 1;

/// -----
/// Error
/// -----

const ECharityDoesNotExist: u64 = 0;
const ENotUpgrade: u64 = 1;
const EWrongVersion: u64 = 2;

/// -----
/// Structs
/// -----
public struct TokenAnalytic has store, copy {
    token: TypeName,
    amount: u64
}

public struct Singleton has key {
    id: UID,

    // `address` type key here will actually store 32 bytes keccak256 hash
    known_charities: Table<address, address>,
    analytics_tokens: Table<TypeName, bool>,
    address_analytics: Table<address, vector<TokenAnalytic>>,
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

/// -----
/// Setup
/// -----
fun init(ctx: &mut TxContext) {
    let singletonId = object::new(ctx);

    transfer::share_object(Singleton {
        id: singletonId,
        known_charities: table::new<address, address>(ctx),
        analytics_tokens: table::new<TypeName, bool>(ctx),
        address_analytics: table::new<address, vector<TokenAnalytic>>(ctx),
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

public fun add_analytics_token(
    singleton: &mut Singleton,
    _owner: &OwnerCap,
    token: TypeName
) {
    assert!(singleton.version == VERSION, EWrongVersion);

    singleton.analytics_tokens.add(token, true);

    event::emit(AddAnalyticToken {
        token,
    });
}

public fun remove_analytics_token(
    singleton: &mut Singleton,
    _owner: &OwnerCap,
    token: TypeName
) {
    assert!(singleton.version == VERSION, EWrongVersion);

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

// -----
// Tests
// -----

#[test_only]
use sui::coin;
#[test_only]
use sui::sui::SUI;
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

        let sui_type = type_name::get<SUI>();

        add_analytics_token(
            &mut singleton,
            &owner,
            sui_type
        );

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

    let sui_type = type_name::get<SUI>();

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        add_analytics_token(
            &mut singleton,
            &owner,
            sui_type
        );

        assert_eq(singleton.analytics_tokens.length(), 1);

        test_scenario::return_shared(singleton);
        scenario.return_to_sender(owner);
    };

    scenario.next_tx(owner);
    {
        let mut singleton: Singleton = scenario.take_shared<Singleton>();
        let owner = scenario.take_from_sender<OwnerCap>();

        remove_analytics_token(
            &mut singleton,
            &owner,
            sui_type
        );

        assert_eq(singleton.analytics_tokens.length(), 0);

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

    let sui_type = type_name::get<SUI>();

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
        add_analytics_token(
            &mut singleton,
            &owner,
            sui_type
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
