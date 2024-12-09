#![cfg(target_os = "macos")]

use localauthentication_rs::{LAPolicy, LocalAuthentication};
use objc::runtime::{BOOL, YES};
use serde::{Deserialize, Serialize};

#[link(name = "CoreGraphics", kind = "framework")]
extern "C" {
    fn CGRequestScreenCaptureAccess() -> BOOL;
    fn CGPreflightScreenCaptureAccess() -> BOOL;
}

pub fn request_screen_capture_access() -> bool {
    unsafe {
        let result: BOOL = CGRequestScreenCaptureAccess();
        result == YES
    }
}

/// Check if we already have screen capture access
/// Returns true if we have access, false otherwise
pub fn preflight_screen_capture_access() -> bool {
    unsafe {
        let result: BOOL = CGPreflightScreenCaptureAccess();
        result == YES
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum AuthPolicy {
    Any,
    Biometrics,
    Watch,
    BiometricsOrWatch,
}

pub fn verify_auth(policy: AuthPolicy) -> bool {
    let local_authentication = LocalAuthentication::new();

    // Try to authenticate the user
    let authenticated = local_authentication.evaluate_policy(
        // LAPolicy::DeviceOwnerAuthenticationWithBiometrics,
        match policy {
            AuthPolicy::Any => LAPolicy::DeviceOwnerAuthentication,
            AuthPolicy::Biometrics => LAPolicy::DeviceOwnerAuthenticationWithBiometrics,
            AuthPolicy::Watch => LAPolicy::DeviceOwnerAuthenticationWithWatch,
            AuthPolicy::BiometricsOrWatch => {
                LAPolicy::DeviceOwnerAuthenticationWithBiometricsOrWatch
            }
        },
        "authenticate your user",
    );

    authenticated
}
