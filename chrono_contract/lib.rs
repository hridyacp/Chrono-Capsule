#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod chrono_contract {

    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    // A unique identifier for each capsule.
    pub type CapsuleId = u64;
  
    // Encodable and decodable struct.
    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Capsule {
        pub creator: AccountId,
        pub recipient: AccountId,
        pub message: Vec<u8>,
        pub unlock_block: BlockNumber,
        pub value_locked: Balance,
    }

    // Event emitted when a new capsule is successfully created.
    #[ink(event)]
    pub struct CapsuleCreated {
        #[ink(topic)]
        id: CapsuleId,
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        unlock_block: BlockNumber,
    }

    // Event emitted when a capsule is successfully opened.
    #[ink(event)]
    pub struct CapsuleOpened {
        #[ink(topic)]
        id: CapsuleId,
        #[ink(topic)]
        by: AccountId,
    }

    // The main storage for our entire smart contract.
    #[ink(storage)]
    pub struct ChronoCapsule {
        capsules: Mapping<CapsuleId, Capsule>,
        next_capsule_id: CapsuleId,
    }

    /// Error
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        UnlockTimeMustBeInFuture,
        CapsuleNotFound,
        CapsuleIsStillLocked,
        NotTheDesignatedRecipient,
        TokenTransferFailed,
        AdditionOverflow
    }

    /// The implementation block.
    impl ChronoCapsule {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                capsules: Mapping::new(),
                next_capsule_id: 0,
            }
        }

        /// Creates a new time capsule.
        #[ink(message, payable)]
        pub fn create_capsule(
            &mut self,
            recipient: AccountId,
            message: Vec<u8>,
            unlock_duration_in_blocks: BlockNumber,
        ) -> Result<(), Error> {
            let creator = self.env().caller();
            let current_block = self.env().block_number();
            let locked_value = self.env().transferred_value();

            if unlock_duration_in_blocks == 0 {
                return Err(Error::UnlockTimeMustBeInFuture);
            }
            let unlock_block = current_block
            .checked_add(unlock_duration_in_blocks)
            .ok_or(Error::AdditionOverflow)?;

            let capsule = Capsule {
                creator,
                recipient,
                message,
                unlock_block,
                value_locked: locked_value,
            };

            let id = self.next_capsule_id;
            self.capsules.insert(id, &capsule);
//Saturating addition to prevent overflow.Doesnt return None instead returns the maximum value if overflow occurs.Ex couner
//next_capsule_id counter, the chance of it overflowing is virtually zero.If you cannot generate a new, valid ID for a capsule, the entire create_capsule operation has failed.hence checked_add and expect
          //  self.next_capsule_id = self.next_capsule_id.saturating_add(1);
          self.next_capsule_id = self.next_capsule_id
    .checked_add(1)
    .expect("Capsule ID overflow. Cannot create more capsules.");

            self.env().emit_event(CapsuleCreated {
                id,
                from: creator,
                to: recipient,
                unlock_block,
            });

            Ok(())
        }

        // Opens a capsule, releasing the message and funds to the recipient.
        #[ink(message)]
        pub fn open_capsule(&mut self, id: CapsuleId) -> Result<(), Error> {
            let caller = self.env().caller();
            let current_block = self.env().block_number();

            // Retrieve the capsule from storage, or return an error if not found.
            // Note: The `ok_or` part implicitly uses a reference to `id` which is correct here.
            let capsule = self.capsules.get(&id).ok_or(Error::CapsuleNotFound)?;

            if capsule.recipient != caller {
                return Err(Error::NotTheDesignatedRecipient);
            }
            if current_block < capsule.unlock_block {
                return Err(Error::CapsuleIsStillLocked);
            }

            // Transfer the locked funds to the recipient.
            if capsule.value_locked > 0 {
                if self.env().transfer(caller, capsule.value_locked).is_err() {
                    return Err(Error::TokenTransferFailed);
                }
            }

            // FIX 2: Pass the key `id` by reference.
            self.capsules.remove(&id);

            self.env().emit_event(CapsuleOpened { id, by: caller });

            Ok(())
        }

        #[ink(message)]
        pub fn get_capsule(&self, id: CapsuleId) -> Option<Capsule> {
            // FIX 3: Pass the key `id` by reference.
            self.capsules.get(&id)
        }

        /// Returns the total number of capsules ever created.
        #[ink(message)]
        pub fn get_total_capsules(&self) -> CapsuleId {
            self.next_capsule_id
        }
    }
}
