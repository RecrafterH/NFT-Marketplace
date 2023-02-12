const { gql } = require("@apollo/client");

const GET_SEARCHNFT_ITEMS = gql`
  query DataQuery($nftAddress: String) {
    itemListeds(first: 5, where: { nftAddress: $nftAddress }) {
      id
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export default GET_SEARCHNFT_ITEMS;
