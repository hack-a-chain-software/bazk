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

        fn add_ceremony_hashes(&mut self, ceremony_id: u32, new_hashes: Vec<File>) -> Result<()> {
            ink::env::debug_println!("[Contract] add_ceremony_hashes called with ceremony_id: {}", ceremony_id);
        
            // Find the ceremony by ID and append hashes, or create a new entry if not found
            match self.ceremony_hashes.iter_mut().find(|(id, _)| *id == ceremony_id) {
                Some((_, ceremony_hashes)) => {
                    ink::env::debug_println!("[Contract] Ceremony ID {} found, adding hashes.", ceremony_id);
                    ceremony_hashes.extend(new_hashes.into_iter());
                },
                None => {
                    ink::env::debug_println!("[Contract] Ceremony ID {} not found, creating new entry.", ceremony_id);
                    self.ceremony_hashes.push((ceremony_id, new_hashes));
                }
            }
        
            ink::env::debug_println!("[Contract] Operation completed for ceremony ID {}.", ceremony_id);
            Ok(())
        }

        #[ink(message)]
        /// Checks if the given IPFS hash is the last hash in the ceremony.
        pub fn is_last_hash(&self, ceremony_id: u32, ipfs_hash: String) -> Result<bool> {
            self.ceremony_hashes.iter()
                .find(|(id, _)| *id == ceremony_id)
                .map_or(Err(Error::CeremonyNotFound), |(_, hashes)| {
                    hashes.last()
                        .map(|last_hash| Ok(last_hash.hash == ipfs_hash))
                        .unwrap_or(Err(Error::CeremonyNotFound))
                })
        }

        #[ink(message)]
        /// Gets the IPFS hashes associated with the given ceremony.
        pub fn get_ceremony_hashes(&self, ceremony_id: u32) -> Result<Vec<File>> {
            self.ceremony_hashes.iter()
                .find(|(id, _)| *id == ceremony_id)
                .map(|(_, hashes)| Ok(hashes.clone()))
                .unwrap_or(Err(Error::CeremonyNotFound))
        }

        #[ink(message)]
        /// Gets the number of IPFS hashes associated with the given ceremony.
        pub fn get_ceremony_hashes_count(&self, ceremony_id: u32) -> Result<u32> {
            let hash_count = self.ceremony_hashes.iter()
                .find(|(id, _)| *id == ceremony_id)
                .map_or(0, |(_, hashes)| hashes.len() as u32);
        
            Ok(hash_count)
        }

        #[ink(message)]
        /// Gets the deadline for the given ceremony.
        pub fn get_ceremony_deadline(&self, ceremony_id: u32) -> Result<u32> {
            self.ceremonies.iter()
                .find(|&ceremony| ceremony.ceremony_id == ceremony_id)
                .map(|ceremony| Ok(ceremony.deadline))
                .unwrap_or(Err(Error::CeremonyNotFound))
        }

        #[ink(message)]
        /// Adds a new contribution to the ceremony.
        pub fn add_contribution(&mut self, ceremony_id: u32, phase: u32, name: String, description: String, deadline: u32, timestamp: u32, metadatas: Vec<Metadata>, hashes: Vec<File>) -> Result<()> {
            // self.ensure_owner()?;
            ink::env::debug_println!("[Contract] add_contribution called with ceremony_id: {}, phase: {}, timestamp: {}", ceremony_id, phase, timestamp);

            // Check if the ceremony already exists
            let ceremony_exists = self.ceremonies.iter().any(|c| c.ceremony_id == ceremony_id);
            ink::env::debug_println!("[Contract] Ceremony exists: {}", ceremony_exists);

            if !ceremony_exists {
                let ceremony = Ceremony {
                    ceremony_id,
                    phase,
                    name: name.clone(),
                    description: description.clone(),
                    deadline,
                    timestamp
                };
                self.ceremonies.push(ceremony);
                ink::env::debug_println!("[Contract] Ceremony created for ceremony ID {}.", ceremony_id);
            }
        
            // Add metadata to the ceremony
            if !metadatas.is_empty() {
                ink::env::debug_println!("[Contract] Adding metadatas to ceremony ID {}.", ceremony_id);
                self.add_ceremony_metadatas(ceremony_id, metadatas)?;
                ink::env::debug_println!("[Contract] Metadatas added to ceremony ID {}.", ceremony_id);
            }

            // Add file hashes to the ceremony
            if !hashes.is_empty() {
                ink::env::debug_println!("[Contract] Adding hashes to ceremony ID {}.", ceremony_id);
                self.add_ceremony_hashes(ceremony_id, hashes)?;
                ink::env::debug_println!("[Contract] Hashes added to ceremony ID {}.", ceremony_id);
            }
        
            ink::env::debug_println!("[Contract] add_contribution completed for ceremony ID {}.", ceremony_id);
            Ok(())
        }

        #[ink(message)]
        /// Gets all ceremonies, including the number of IPFS hashes associated with each.
        pub fn get_cerimonies(&self) -> Result<Vec<(Ceremony, u32)>> {
            let ceremonies_with_hash_counts = self.ceremonies.iter().map(|ceremony| {
                let hash_count = self.ceremony_hashes.iter()
                    .find(|(id, _)| *id == ceremony.ceremony_id)
                    .map_or(0, |(_, hashes)| hashes.len()) as u32;
                (ceremony.clone(), hash_count)
            }).collect::<Vec<(Ceremony, u32)>>();
        
            Ok(ceremonies_with_hash_counts)
        }

        #[ink(message)]
        /// Gets the ceremony with the given id, including IPFS hashes and metadata.
        pub fn get_ceremony(&self, ceremony_id: u32) -> Result<(Ceremony, Vec<File>, Vec<Metadata>), Error> {
            // Find the ceremony with the given id
            let ceremony = self.ceremonies.iter()
                .find(|c| c.ceremony_id == ceremony_id)
                .ok_or(Error::CeremonyNotFound)?;
        
            // Retrieve hashes associated with the ceremony
            let hashes = self.ceremony_hashes.iter()
                .find(|(id, _)| id == &ceremony_id)
                .map_or_else(|| Ok(Vec::new()), |(_, h)| Ok(h.clone()))?;
        
            // Retrieve metadata associated with the ceremony
            let metadatas = self.ceremony_metadatas.iter()
                .find(|(id, _)| id == &ceremony_id)
                .map_or_else(|| Ok(Vec::new()), |(_, m)| Ok(m.clone()))?;
        
            Ok((ceremony.clone(), hashes, metadatas))
        }
        
        fn add_ceremony_metadatas(&mut self, ceremony_id: u32, metadatas: Vec<Metadata>) -> Result<()> {
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
        /// Gets the metadata for the given ceremony.
        pub fn get_ceremony_metadata(&self, ceremony_id: u32) -> Result<Vec<Metadata>> {
            self.ceremony_metadatas.iter()
                .find(|(id, _)| *id == ceremony_id)
                .map(|(_, metadatas)| Ok(metadatas.clone()))
                .unwrap_or(Err(Error::CeremonyNotFound))
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
