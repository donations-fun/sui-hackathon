module donate::donate;

const VERSION: u64 = 1;

/// -----
/// Error
/// -----

const ENotUpgrade: u64 = 0;

/// -----
/// Structs
/// -----
public struct Singleton has key {
    id: UID,

    version: u64,
}

public struct OwnerCap has key, store {
    id: UID,
}

/// -----
/// Events
/// -----

/// -----
/// Setup
/// -----
fun init(ctx: &mut TxContext) {
    let singletonId = object::new(ctx);

    transfer::share_object(Singleton {
        id: singletonId,
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


// -----
// Private Functions
// -----


// -----
// Tests
// -----
