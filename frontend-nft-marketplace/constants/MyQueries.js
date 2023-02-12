const { gql } = require("@apollo/client");
let state = "0";

const GET_My_ITEMS = gql`
  query DataQuery($user: String) {
    activeItems(
      first: 5
      where: {
        seller: $user
        buyer: "0x0000000000000000000000000000000000000000"
      }
    ) {
      id
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export default GET_My_ITEMS;
