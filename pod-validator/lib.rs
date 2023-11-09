#![cfg_attr(not(feature = "std"), no_std, no_main)]
//! This is a Phala Phat Contract that validates the RA report and signs the inner user_report_data.

extern crate alloc;

#[ink::contract]
mod pod_validator {
    use alloc::string::String;
    use alloc::vec::Vec;
    use ink::codegen::Env as _;
    use pink::chain_extension::SigType;
    use scale::{Decode, Encode};
    use sgx_attestation::ias;

    type Result<T, E = Error> = core::result::Result<T, E>;

    #[derive(Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        BadOrigin,
        InvalidReport,
        PodNotAllowed,
    }

    /// A new pod mr_enclave is added.
    #[ink(event)]
    pub struct PodAdded {
        mr_enclave: [u8; 32],
    }

    #[derive(Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    /// Struct representing the signed payload.
    pub struct SignedReport {
        pub report: String,
        pub signature: String,
        pub certificate: String,
    }

    #[ink(storage)]
    pub struct Validator {
        owner: AccountId,
        allowlist: Vec<[u8; 32]>,
    }

    impl Validator {
        #[ink(constructor)]
        pub fn default() -> Self {
            Self {
                owner: Self::env().caller(),
                allowlist: Vec::new(),
            }
        }

        #[ink(message)]
        /// Returns the public key.
        pub fn public_key(&self) -> Vec<u8> {
            pink::ext().get_public_key(SigType::Sr25519, &self.key())
        }

        #[ink(message)]
        pub fn allow(&mut self, pod: [u8; 32]) -> Result<()> {
            self.ensure_owner()?;
            pink::info!("Added: 0x{}", hex_fmt::HexFmt(&pod));
            self.allowlist.push(pod);
            self.env().emit_event(PodAdded { mr_enclave: pod });
            Ok(())
        }

        #[ink(message)]
        /// Validates the given RA report and signs the inner user_report_data.
        pub fn sign(&self, report: SignedReport) -> Result<Vec<u8>> {
            let key = self.key();
            let report = ias::SignedIasReport {
                ra_report: report.report,
                raw_signing_cert: report.certificate,
                signature: report.signature,
            };
            let now =
                core::time::Duration::from_millis(pink::ext().untrusted_millis_since_unix_epoch());
            report.verify(now).or(Err(Error::InvalidReport))?;
            let quote = report
                .parse_report()
                .or(Err(Error::InvalidReport))?
                .decode_quote()
                .or(Err(Error::InvalidReport))?;
            self.ensure_allowed(quote.mr_enclave)?;
            let message = quote.report_data;
            let signature = pink::ext().sign(SigType::Sr25519, &key, &message);
            Ok(signature)
        }
    }

    impl Validator {
        /// Returns the key used to sign the execution result.
        fn key(&self) -> Vec<u8> {
            pink::ext().derive_sr25519_key(b"signer"[..].into())
        }

        fn ensure_owner(&self) -> Result<AccountId> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::BadOrigin);
            }
            return Ok(caller);
        }

        fn ensure_allowed(&self, mr_enclave: [u8; 32]) -> Result<()> {
            if self.allowlist.contains(&mr_enclave) {
                return Ok(());
            } else {
                return Err(Error::PodNotAllowed);
            }
        }
    }
}
