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
        CeremonyNotFound,
    }

    /// A new pod mr_enclave is added.
    #[ink(event)]
    pub struct PodAdded {
        mr_enclave: [u8; 32],
    }

    #[ink(event)]
    pub struct CeremonyAdded {
        ceremony_id: u32,
        phase: u32,
        name: String,
        description: String,
        deadline: u32,
        timestamp: u32
    }

    #[ink(event)]
    pub struct MetadataAdded {
        ceremony_id: u32,
        name: String,
        value: String
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
        ceremony_hashes: Vec<(u32, Vec<File>)>,
        ceremony_metadatas: Vec<(u32, Vec<Metadata>)>,
        ceremonies: Vec<Ceremony>
    }

    #[derive(Clone, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Ceremony {
        ceremony_id: u32,
        phase: u32,
        name: String,
        description: String,
        deadline: u32,
        timestamp: u32
    }

    #[derive(Clone, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Metadata {
        name: String,
        value: String
    }

    #[derive(Clone, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct File {
        hash: String,
        name: String,
        timestamp: u32,
    }

    impl Validator {
        #[ink(constructor)]
        pub fn default() -> Self {
            Self {
                owner: Self::env().caller(),
                allowlist: Vec::new(),
                ceremony_hashes: Vec::new(),
                ceremony_metadatas: Vec::new(),
                ceremonies: Vec::new()

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

        #[ink(message)]
        pub fn add_ceremony_hashes(&mut self, ceremony_id: u32, hashes: Vec<File>) -> Result<()> {
            self.ensure_owner()?;
            ink::env::debug_println!("[Contract] add_ceremony_hashes called with ceremony_id: {}", ceremony_id);

            let mut found = false;
            for (id, ceremony_hashes) in self.ceremony_hashes.iter_mut() {
                if *id == ceremony_id {
                    ink::env::debug_println!("[Contract] Ceremony ID {} found, adding hashes.", ceremony_id);
                    for hash in &hashes {
                        ceremony_hashes.push(hash.clone());
                    }
                    found = true;
                    ink::env::debug_println!("[Contract] Hashes added to ceremony ID {}.", ceremony_id);
                    break;
                }
            }

            if !found {
                ink::env::debug_println!("[Contract] Ceremony ID {} not found, creating new entry.", ceremony_id);
                self.ceremony_hashes.push((ceremony_id, hashes.clone()));
                ink::env::debug_println!("[Contract] Ceremony ID {} created.", ceremony_id);
            }

            Ok(())
        }

        #[ink(message)]
        pub fn is_last_hash(&self, ceremony_id: u32, ipfs_hash: String) -> Result<bool> {
            for (id, hashes) in self.ceremony_hashes.iter() {
                if id == &ceremony_id {
                    if let Some(last_hash) = hashes.last() {
                        return Ok(last_hash.hash == ipfs_hash);
                    }
                }
            }
            Err(Error::CeremonyNotFound)
        }

        #[ink(message)]
        pub fn get_ceremony_hashes(&self, ceremony_id: u32) -> Result<Vec<File>> {
            for (id, hashes) in self.ceremony_hashes.iter() {
                if id == &ceremony_id {
                    return Ok(hashes.clone());
                }
            }
            Err(Error::CeremonyNotFound)
        }

        #[ink(message)]
        pub fn get_ceremony_hashes_count(&self, ceremony_id: u32) -> Result<u32> {
            for (id, hashes) in self.ceremony_hashes.iter() {
                if id == &ceremony_id {
                    return Ok(hashes.len() as u32);
                }
            }
            return Ok(0);
        }

        #[ink(message)]
        pub fn get_ceremony_deadline(&self, ceremony_id: u32) -> Result<u32> {
            for ceremony in self.ceremonies.iter() {
                if ceremony.ceremony_id == ceremony_id {
                    return Ok(ceremony.deadline);
                }
            }
            Err(Error::CeremonyNotFound)
        }

        #[ink(message)]
        pub fn new_ceremony(&mut self, ceremony_id: u32, phase: u32, name: String, description: String, deadline: u32, timestamp: u32, metadatas: Vec<Metadata>) -> Result<()> {
            self.ensure_owner()?;
            ink::env::debug_println!("[Contract] new_ceremony called with ceremony_id: {}, phase: {}, timestamp: {}", ceremony_id, phase, timestamp);
            
            self.ceremonies.push(Ceremony {
                ceremony_id: ceremony_id,
                phase: phase,
                name: name.clone(),
                description: description.clone(),
                deadline: deadline,
                timestamp: timestamp
            });

            ink::env::debug_println!("[Contract] Ceremony created for ceremony ID {}.", ceremony_id);
            ink::env::debug_println!("[Contract] Adding metadatas to ceremony ID {}.", ceremony_id);

            self.add_ceremony_metadatas(ceremony_id, metadatas)?;

            ink::env::debug_println!("[Contract] Metadatas added to ceremony ID {}.", ceremony_id);
            
            self.env().emit_event(CeremonyAdded { ceremony_id: ceremony_id, phase: phase, name: name.clone(), description: description.clone(), deadline: deadline, timestamp: timestamp });

            ink::env::debug_println!("[Contract] CeremonyAdded event emitted.");
            Ok(())
        }

        #[ink(message)]
        pub fn get_cerimonies(&self) -> Result<Vec<Ceremony>> {
            return Ok(self.ceremonies.clone());
        }

        #[ink(message)]
        pub fn get_ceremony(&self, ceremony_id: u32) -> Result<Ceremony> {
            for ceremony in self.ceremonies.iter() {
                if ceremony.ceremony_id == ceremony_id {
                    return Ok(ceremony.clone());
                }
            }
            Err(Error::CeremonyNotFound)
        }

        #[ink(message)]
        pub fn add_ceremony_metadatas(&mut self, ceremony_id: u32, metadatas: Vec<Metadata>) -> Result<()> {
            self.ensure_owner()?;
            ink::env::debug_println!("[Contract] add_ceremony_metadatas called with ceremony_id: {}", ceremony_id);

            let mut ceremony_found = false;
            for (id, ceremony_metadatas) in self.ceremony_metadatas.iter_mut() {
                if *id == ceremony_id {
                    ink::env::debug_println!("[Contract] Ceremony ID {} found, adding metadatas.", ceremony_id);

                    for metadata in &metadatas {
                        let mut metadata_found = false;
                        for ceremony_metadata in ceremony_metadatas.iter_mut() {
                            if ceremony_metadata.name == metadata.name {
                                ink::env::debug_println!("[Contract] Metadata {} found, updating value.", metadata.name);
                                ceremony_metadata.value = metadata.value.clone();
                                metadata_found = true;
                                break;
                            }
                        }
                        if !metadata_found {
                            ink::env::debug_println!("[Contract] Metadata {} not found, creating new entry.", metadata.name);
                            ceremony_metadatas.push(metadata.clone());
                        }
                    }

                    ceremony_found = true;
                    break;
                }
            }
       
            if !ceremony_found {
                ink::env::debug_println!("[Contract] Ceremony ID {} not found, creating new entry.", ceremony_id);
                self.ceremony_metadatas.push((ceremony_id, metadatas.clone()));
                ink::env::debug_println!("[Contract] Ceremony metadata created for ceremony ID {}.", ceremony_id);
            }

            Ok(())
        }

        #[ink(message)]
        pub fn get_ceremony_metadata(&self, ceremony_id: u32) -> Result<Vec<Metadata>> {
            for (id, metadatas) in self.ceremony_metadatas.iter() {
                if id == &ceremony_id {
                    return Ok(metadatas.clone());
                }
            }
            Err(Error::CeremonyNotFound)
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
