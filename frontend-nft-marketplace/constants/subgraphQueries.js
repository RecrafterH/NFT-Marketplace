const { gql } = require("@apollo/client");

const GET_ACITVE_ITEMS = gql`
  {
    activeItems(
      first: 10
      where: { buyer: "0x0000000000000000000000000000000000000000" }
    ) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export default GET_ACITVE_ITEMS;
