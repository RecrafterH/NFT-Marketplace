const { gql } = require("@apollo/client");

const GET_SEARCHSELLER_ITEMS = gql`
  query DataQuery($seller: String) {
    itemListeds(first: 5, where: { seller: $seller }) {
      id
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export default GET_SEARCHSELLER_ITEMS;
