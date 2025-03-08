module donate::utils;

use sui::address;
use std::ascii::String;
use sui::hash::keccak256;

/// ------
/// Public Functions
/// ------
public(package) fun get_charity_id(charity_name: String): address {
    address::from_bytes(keccak256(&charity_name.into_bytes()))
}
