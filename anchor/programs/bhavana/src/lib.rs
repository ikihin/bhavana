use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("BhvnRWA1111111111111111111111111111111111111");

#[program]
pub mod bhavana {
    use super::*;

    /// Creates a new property listing with an SPL token mint.
    /// Each property gets a PDA storing metadata and a token mint for fractional shares.
    pub fn initialize_property(
        ctx: Context<InitializeProperty>,
        name: String,
        location: String,
        total_shares: u64,
        price_per_share_lamports: u64,
        annual_yield_bps: u16,
    ) -> Result<()> {
        require!(name.len() <= 64, BhavanaError::NameTooLong);
        require!(location.len() <= 128, BhavanaError::LocationTooLong);
        require!(total_shares > 0, BhavanaError::InvalidShares);
        require!(price_per_share_lamports > 0, BhavanaError::InvalidPrice);

        let property = &mut ctx.accounts.property;
        property.admin = ctx.accounts.admin.key();
        property.name = name.clone();
        property.location = location.clone();
        property.total_shares = total_shares;
        property.shares_sold = 0;
        property.price_per_share_lamports = price_per_share_lamports;
        property.annual_yield_bps = annual_yield_bps;
        property.mint = ctx.accounts.mint.key();
        property.vault = ctx.accounts.vault.key();
        property.is_active = true;
        property.bump = ctx.bumps.property;

        emit!(PropertyInitialized {
            property: property.key(),
            name,
            location,
            total_shares,
            price_per_share_lamports,
            annual_yield_bps,
            mint: ctx.accounts.mint.key(),
        });

        Ok(())
    }

    /// Buy fractional shares of a property.
    /// Transfers SOL from buyer to property vault, mints SPL tokens to buyer's ATA.
    pub fn buy_shares(ctx: Context<BuyShares>, num_shares: u64) -> Result<()> {
        let property = &mut ctx.accounts.property;

        require!(property.is_active, BhavanaError::PropertyNotActive);
        require!(
            property.shares_sold.checked_add(num_shares).unwrap() <= property.total_shares,
            BhavanaError::SoldOut
        );

        let total_cost = property
            .price_per_share_lamports
            .checked_mul(num_shares)
            .unwrap();

        require!(
            ctx.accounts.buyer.lamports() >= total_cost,
            BhavanaError::InsufficientFunds
        );

        // Transfer SOL from buyer to vault PDA
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_ctx, total_cost)?;

        // Mint SPL tokens to buyer's associated token account
        // The mint authority is the property PDA itself
        let property_name = property.name.as_bytes();
        let seeds = &[
            b"property",
            property_name,
            &[property.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.property.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        // Each share = 1 token (0 decimals)
        token::mint_to(cpi_ctx, num_shares)?;

        property.shares_sold = property.shares_sold.checked_add(num_shares).unwrap();

        emit!(SharesPurchased {
            property: property.key(),
            buyer: ctx.accounts.buyer.key(),
            num_shares,
            total_cost_lamports: total_cost,
            shares_remaining: property.total_shares - property.shares_sold,
        });

        Ok(())
    }

    /// Admin distributes rental yield to a specific token holder.
    /// Called once per holder. In production, a cranker iterates all holders.
    /// Yield amount is calculated pro-rata: (holder_shares / total_shares) * yield_amount.
    pub fn distribute_yield(
        ctx: Context<DistributeYield>,
        total_yield_lamports: u64,
    ) -> Result<()> {
        let property = &ctx.accounts.property;

        require!(property.is_active, BhavanaError::PropertyNotActive);
        require!(
            ctx.accounts.admin.key() == property.admin,
            BhavanaError::Unauthorized
        );

        let holder_balance = ctx.accounts.holder_token_account.amount;
        require!(holder_balance > 0, BhavanaError::NoShares);

        // Pro-rata calculation: (holder_shares * total_yield) / total_shares
        let holder_yield = (holder_balance as u128)
            .checked_mul(total_yield_lamports as u128)
            .unwrap()
            .checked_div(property.total_shares as u128)
            .unwrap() as u64;

        require!(holder_yield > 0, BhavanaError::YieldTooSmall);
        require!(
            ctx.accounts.vault.lamports() >= holder_yield,
            BhavanaError::InsufficientVaultFunds
        );

        // Transfer SOL from vault PDA to holder
        // Vault is a PDA owned by the system program — use lamport manipulation
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= holder_yield;
        **ctx.accounts.holder.to_account_info().try_borrow_mut_lamports()? += holder_yield;

        emit!(YieldDistributed {
            property: ctx.accounts.property.key(),
            holder: ctx.accounts.holder.key(),
            holder_shares: holder_balance,
            yield_lamports: holder_yield,
            total_yield_lamports,
        });

        Ok(())
    }

    /// Admin can deactivate a property (stops new purchases).
    pub fn toggle_property(ctx: Context<AdminAction>, is_active: bool) -> Result<()> {
        let property = &mut ctx.accounts.property;
        require!(
            ctx.accounts.admin.key() == property.admin,
            BhavanaError::Unauthorized
        );
        property.is_active = is_active;
        Ok(())
    }
}

// ============================================================
// Account structs
// ============================================================

#[account]
#[derive(InitSpace)]
pub struct PropertyAccount {
    pub admin: Pubkey,
    #[max_len(64)]
    pub name: String,
    #[max_len(128)]
    pub location: String,
    pub total_shares: u64,
    pub shares_sold: u64,
    pub price_per_share_lamports: u64,
    pub annual_yield_bps: u16,
    pub mint: Pubkey,
    pub vault: Pubkey,
    pub is_active: bool,
    pub bump: u8,
}

// ============================================================
// Instruction accounts
// ============================================================

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeProperty<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + PropertyAccount::INIT_SPACE,
        seeds = [b"property", name.as_bytes()],
        bump,
    )]
    pub property: Account<'info, PropertyAccount>,

    /// The SPL token mint for this property's shares.
    /// Mint authority = property PDA (so program can mint on buy).
    #[account(
        init,
        payer = admin,
        mint::decimals = 0,
        mint::authority = property,
        seeds = [b"mint", name.as_bytes()],
        bump,
    )]
    pub mint: Account<'info, Mint>,

    /// SOL vault to hold investment funds and yield for distribution.
    /// CHECK: PDA used as a SOL vault (no data, just lamports).
    #[account(
        mut,
        seeds = [b"vault", name.as_bytes()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(
        mut,
        seeds = [b"property", property.name.as_bytes()],
        bump = property.bump,
    )]
    pub property: Account<'info, PropertyAccount>,

    #[account(
        mut,
        address = property.mint,
    )]
    pub mint: Account<'info, Mint>,

    /// CHECK: SOL vault PDA
    #[account(
        mut,
        seeds = [b"vault", property.name.as_bytes()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct DistributeYield<'info> {
    #[account(
        seeds = [b"property", property.name.as_bytes()],
        bump = property.bump,
    )]
    pub property: Account<'info, PropertyAccount>,

    /// CHECK: SOL vault PDA — funds are sent FROM here
    #[account(
        mut,
        seeds = [b"vault", property.name.as_bytes()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    /// The token account of the holder receiving yield
    #[account(
        constraint = holder_token_account.mint == property.mint,
        constraint = holder_token_account.owner == holder.key(),
    )]
    pub holder_token_account: Account<'info, TokenAccount>,

    /// CHECK: The wallet receiving the yield SOL
    #[account(mut)]
    pub holder: SystemAccount<'info>,

    #[account(
        mut,
        constraint = admin.key() == property.admin @ BhavanaError::Unauthorized,
    )]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(
        mut,
        seeds = [b"property", property.name.as_bytes()],
        bump = property.bump,
    )]
    pub property: Account<'info, PropertyAccount>,

    #[account(mut)]
    pub admin: Signer<'info>,
}

// ============================================================
// Events
// ============================================================

#[event]
pub struct PropertyInitialized {
    pub property: Pubkey,
    pub name: String,
    pub location: String,
    pub total_shares: u64,
    pub price_per_share_lamports: u64,
    pub annual_yield_bps: u16,
    pub mint: Pubkey,
}

#[event]
pub struct SharesPurchased {
    pub property: Pubkey,
    pub buyer: Pubkey,
    pub num_shares: u64,
    pub total_cost_lamports: u64,
    pub shares_remaining: u64,
}

#[event]
pub struct YieldDistributed {
    pub property: Pubkey,
    pub holder: Pubkey,
    pub holder_shares: u64,
    pub yield_lamports: u64,
    pub total_yield_lamports: u64,
}

// ============================================================
// Errors
// ============================================================

#[error_code]
pub enum BhavanaError {
    #[msg("Insufficient SOL to purchase shares")]
    InsufficientFunds,
    #[msg("All shares for this property have been sold")]
    SoldOut,
    #[msg("This property is not currently active")]
    PropertyNotActive,
    #[msg("Only the admin can perform this action")]
    Unauthorized,
    #[msg("Property name must be 64 characters or less")]
    NameTooLong,
    #[msg("Location must be 128 characters or less")]
    LocationTooLong,
    #[msg("Total shares must be greater than zero")]
    InvalidShares,
    #[msg("Price per share must be greater than zero")]
    InvalidPrice,
    #[msg("Holder has no shares in this property")]
    NoShares,
    #[msg("Calculated yield is zero (too few shares)")]
    YieldTooSmall,
    #[msg("Vault does not have enough SOL for this distribution")]
    InsufficientVaultFunds,
}
