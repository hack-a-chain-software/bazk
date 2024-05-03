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
    use ink::storage::Mapping;
    use ink::storage::traits::StorageLayout;

    type Result<T, E = Error> = core::result::Result<T, E>;

    #[derive(Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        BadOrigin,
        InvalidReport,
        PodNotAllowed,
        CeremonyNotFound,
        CeremonyAlreadyExists,
        Overflow,
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
        allowlist: Mapping<[u8; 32], bool>,
        ceremony_hashes: Mapping<u32, Vec<File>>,
        ceremony_metadatas: Mapping<u32, Vec<Metadata>>,
        ceremonies: Mapping<u32, Ceremony>,
        ceremonies_indexes: Mapping<u32, u32>,
        ceremonies_count: u32
    }
    
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo), derive(StorageLayout))]
    #[derive(Clone, Encode, Decode)]
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
                allowlist: Mapping::new(),
                ceremony_hashes: Mapping::new(),
                ceremony_metadatas: Mapping::new(),
                ceremonies: Mapping::new(),
                ceremonies_indexes: Mapping::new(),
                ceremonies_count: 0
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
            self.allowlist.insert(pod, &true);
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
            let ceremony_hashes = self.ceremony_hashes.get(ceremony_id).unwrap_or_default();

            // add new_hashes to existing ceremony_hashes
            let mut new_ceremony_hashes = ceremony_hashes.clone();
            new_ceremony_hashes.extend(new_hashes.into_iter());

            self.ceremony_hashes.insert(ceremony_id, &new_ceremony_hashes);

            Ok(())
        }

        #[ink(message)]
        /// Checks if the given IPFS hash is the last hash in the ceremony.
        pub fn is_last_hash(&self, ceremony_id: u32, ipfs_hash: String) -> Result<bool> {
            let ceremony_hashes = self.ceremony_hashes.get(ceremony_id).unwrap_or_default();
            let last_hash = ceremony_hashes.last().map(|f| f.hash.clone()).unwrap_or_default();
            Ok(last_hash == ipfs_hash)
        }

        #[ink(message)]
        /// Gets the IPFS hashes associated with the given ceremony.
        pub fn get_ceremony_hashes(&self, ceremony_id: u32) -> Result<Vec<File>> {
            self.ceremony_hashes.get(ceremony_id).map_or_else(|| Ok(Vec::new()), |hashes| Ok(hashes.clone()))
        }

        #[ink(message)]
        pub fn get_ceremonies_count(&self) -> u32 {
            self.ceremonies_count
        }

        #[ink(message)]
        /// Gets the number of IPFS hashes associated with the given ceremony.
        pub fn get_ceremony_hashes_count(&self, ceremony_id: u32) -> Result<u32> {
            let hashes = self.ceremony_hashes.get(ceremony_id).unwrap_or_default();
            Ok(hashes.len() as u32)
        }

        #[ink(message)]
        /// Gets the deadline for the given ceremony.
        pub fn get_ceremony_deadline(&self, ceremony_id: u32) -> Result<u32> {
            let ceremony = self.ceremonies.get(ceremony_id)
                .ok_or(Error::CeremonyNotFound)?;
            
            Ok(ceremony.deadline)
        }

        #[ink(message)]
        /// Adds a new contribution to the ceremony.
        pub fn add_contribution(&mut self, ceremony_id: u32, phase: u32, name: String, description: String, deadline: u32, timestamp: u32, metadatas: Vec<Metadata>, hashes: Vec<File>) -> Result<()> {
            // Check ownership and permissions if necessary
            // self.ensure_owner()?;
        
            ink::env::debug_println!("[Contract] add_contribution called with ceremony_id: {}, phase: {}, timestamp: {}", ceremony_id, phase, timestamp);
        
            // Retrieve or create the ceremony
            let ceremony = self.ceremonies.get(ceremony_id).unwrap_or_else(|| Ceremony {
                ceremony_id,
                phase,
                name: name.clone(),
                description: description.clone(),
                deadline,
                timestamp,
            });
        
            if !self.ceremonies.contains(ceremony_id) {
                self.ceremonies.insert(ceremony_id, &ceremony);
            }
            
            self.ceremonies_indexes.insert(self.ceremonies_count, &ceremony_id);
            match self.ceremonies_count.checked_add(1) {
                Some(new_count) => self.ceremonies_count = new_count,
                None => return Err(Error::Overflow),
            }
            
            ink::env::debug_println!("[Contract] Ceremony (created or updated) for ceremony ID {}.", ceremony_id);
        
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
        pub fn get_cerimonies(&self, start: u32, count: u32) -> Result<Vec<(Ceremony, u32)>> {
            let mut ceremonies = Vec::new();
            let end = start.checked_add(count).ok_or(Error::Overflow)?;
            for i in start..end {
                if let Some(ceremony_id) = self.ceremonies_indexes.get(i) {
                    if let Some(ceremony) = self.ceremonies.get(ceremony_id) {
                        let hash_count = self.ceremony_hashes.get(ceremony_id)
                            .map_or(0, |hashes| hashes.len()) as u32;
                        ceremonies.push((ceremony.clone(), hash_count));
                    }
                }
            }
            Ok(ceremonies)
        }

        #[ink(message)]
        /// Gets the ceremony with the given id, including IPFS hashes and metadata.
        pub fn get_ceremony(&self, ceremony_id: u32) -> Result<(Ceremony, Vec<File>, Vec<Metadata>), Error> {
            // Find the ceremony with the given id
            let ceremony = self.ceremonies.get(ceremony_id).ok_or(Error::CeremonyNotFound)?;
        
            // Retrieve hashes associated with the ceremony
            let hashes = self.ceremony_hashes.get(ceremony_id).unwrap_or_default();
        
            // Retrieve metadata associated with the ceremony
            let metadatas = self.ceremony_metadatas.get(ceremony_id).unwrap_or_default();
            
            Ok((ceremony.clone(), hashes, metadatas))
        }
        
        fn add_ceremony_metadatas(&mut self, ceremony_id: u32, metadatas: Vec<Metadata>) -> Result<()> {
            ink::env::debug_println!("[Contract] add_ceremony_metadatas called with ceremony_id: {}", ceremony_id);

            // Find the ceremony by ID and append metadatas, or create a new entry if not found and update the entry if it already exists
            let ceremony_metadatas = self.ceremony_metadatas.get(ceremony_id).unwrap_or_default();

            // add metadatas to existing ceremony_metadatas
            let mut new_ceremony_metadatas = ceremony_metadatas.clone();
            new_ceremony_metadatas.extend(metadatas.into_iter());

            self.ceremony_metadatas.insert(ceremony_id, &new_ceremony_metadatas);

            Ok(())
        }
        
        #[ink(message)]
        /// Gets the metadata for the given ceremony.
        pub fn get_ceremony_metadata(&self, ceremony_id: u32) -> Result<Vec<Metadata>> {
            self.ceremony_metadatas.get(ceremony_id).map_or_else(|| Ok(Vec::new()), |metadatas| Ok(metadatas.clone()))
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
            Ok(caller)
        }

        fn ensure_allowed(&self, mr_enclave: [u8; 32]) -> Result<()> {
            let is_allowed = self.allowlist.get(mr_enclave).unwrap_or(false);
            if is_allowed {
                Ok(())
            } else {
                Err(Error::PodNotAllowed)
            }
        }
    }
}
