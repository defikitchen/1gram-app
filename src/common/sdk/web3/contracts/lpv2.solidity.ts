export const lpv2Abi = [
  "function name() pure returns (string memory)",
  "function symbol() pure returns (string memory)",
  "function decimals() pure returns (uint8)",
  "function totalSupply() view returns (uint)",
  "function balanceOf(address owner) view returns (uint)",
  "function allowance(address owner, address spender) view returns (uint)",
  "function approve(address spender, uint value) returns (bool)",
  "function transfer(address to, uint value) returns (bool)",
  "function transferFrom(address from, address to, uint value) returns (bool)",
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function PERMIT_TYPEHASH() pure returns (bytes32)",
  "function nonces(address owner) view returns (uint)",
  "function factory() view returns (address)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function price0CumulativeLast() view returns (uint)",
  "function price1CumulativeLast() view returns (uint)",
  "function kLast() view returns (uint)",
  "function mint(address to) returns (uint liquidity)",
  "function burn(address to) returns (uint amount0, uint amount1)"
];
