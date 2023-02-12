const { gql } = require("@apollo/client");

const GET_SINGLE_ITEMS = gql`
  query DataQuery($nftAddress: String, $tokenId: String) {
    itemListeds(
      first: 5
      where: { nftAddress: $nftAddress, tokenId: $tokenId }
    ) {
      id
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export default GET_SINGLE_ITEMS;
