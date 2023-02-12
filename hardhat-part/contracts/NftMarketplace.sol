// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__alreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NftMarketplace__NoProceeds();
error NftMarketplace_TransferFailed();

contract NftMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        uint256 price;
        address seller;
    }

    struct CollectionRoyalties {
        address creator;
        uint royalties;
    }

    // State variables
    uint256 public fee = 20;

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 tokenId,
        uint256 price
    );
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 tokenId,
        uint256 price
    );
    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 tokenId
    );

    // NFT Contract address -> NFT TokenId -> Listing
    mapping(address => mapping(uint256 => Listing)) private listings;

    // Seller address -> amount earned
    mapping(address => uint256) private proceeds;

    // Nft address -> collection royalties
    mapping(address => CollectionRoyalties)
        private addressToCollectionRoyalties;

    // This address -> collected fees
    mapping(address => uint256) private feeCollector;

    ///////////////
    // modifiers //
    ///////////////

    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__alreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    ////////////////////
    // Main Functions //
    ////////////////////

    /*
     * @notice Method for listing your NFT on the marketplace
     * @param nftAddress: Address of the NFT
     * @param tokenId: The Token ID of the NFT
     * @param price: sale price of the listed NFT
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId, msg.sender)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }

        listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable isListed(nftAddress, tokenId) {
        Listing memory listedItem = listings[nftAddress][tokenId];
        uint feeValue = (msg.value * fee) / 1000;
        uint royalties = (msg.value *
            addressToCollectionRoyalties[nftAddress].royalties) / 10000;
        uint buyerProceeds = msg.value - royalties - feeValue;

        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(
                nftAddress,
                tokenId,
                listedItem.price
            );
        }
        proceeds[listedItem.seller] =
            proceeds[listedItem.seller] +
            buyerProceeds;
        proceeds[addressToCollectionRoyalties[nftAddress].creator] =
            proceeds[addressToCollectionRoyalties[nftAddress].creator] +
            royalties;
        feeCollector[address(this)] = feeCollector[address(this)] + feeValue;
        delete (listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            tokenId
        );
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    function cancelListing(
        address nftAddress,
        uint256 tokenId
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 balance = proceeds[msg.sender];
        if (balance <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        if (!success) {
            revert NftMarketplace_TransferFailed();
        }
    }

    function setCollectionRoyalties(
        address creator,
        address nftAddress,
        uint royalties
    ) public onlyOwner {
        require(
            addressToCollectionRoyalties[nftAddress].creator == address(0),
            "The royalty is already set"
        );
        require(royalties <= 10000, "Royalty must be below 10001");
        addressToCollectionRoyalties[nftAddress] = CollectionRoyalties(
            creator,
            royalties
        );
    }

    function updateCollectionRoyalities(
        address creator,
        address nftAddress,
        uint newRoyalties
    ) public onlyOwner {
        require(
            addressToCollectionRoyalties[nftAddress].creator != address(0),
            "There is no royalty set"
        );
        require(newRoyalties <= 10000, "Royalty must be below 10001");
        addressToCollectionRoyalties[nftAddress].royalties = newRoyalties;
        addressToCollectionRoyalties[nftAddress].creator = creator;
    }

    function updateFee(uint newFee) public onlyOwner {
        require(newFee <= 1000, "Fee must be below 1001");
        fee = newFee;
    }

    function withdrawFees() public onlyOwner {
        uint feeValue = feeCollector[address(this)];
        require(feeValue > 0, "The balance is 0");
        feeCollector[address(this)] = 0;
        (bool success, ) = msg.sender.call{value: feeValue}("");
        require(success, "This transaction failed");
    }

    //////////////////////
    // Getter Functions //
    //////////////////////

    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return proceeds[seller];
    }

    function getCollectedFees() external view onlyOwner returns (uint256) {
        uint fees = feeCollector[address(this)];
        return fees;
    }
}
