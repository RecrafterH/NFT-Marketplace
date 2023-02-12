const { gql } = require("@apollo/client");
let state = "0";

const GET_My_ITEMS = gql`
  query DataQuery($user: String) {
    itemListeds(first: 5, where: { seller: $user }) {
      id
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export default GET_My_ITEMS;
