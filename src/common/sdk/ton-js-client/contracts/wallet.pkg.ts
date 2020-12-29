const imageBase64 =
  "te6ccgECEQEAAi0AAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAib/APSkICLAAZL0oOGK7VNYMPShCAQBCvSkIPShBQIJnwAAAAMHBgAvO1E0NP/0z/TANcL//hqf/hh+Gb4Y/higAC8+ELIy//4Q88LP/hGzwsA+EoBy//J7VSACASAMCQEC/woB/n8h7UTQINdJwgGOFNP/0z/TANcL//hqf/hh+Gb4Y/hijhv0BXD4anABgED0DvK91wv/+GJw+GNw+GZ/+GHi0wABjhKBAgDXGCD5AVj4QiD4ZfkQ8qje0z8Bjh74QyG5IJ8wIPgjgQPoqIIIG3dAoLnekvhj4IA08jTY0x8hwQMLAC4ighD////9vLGS8jzgAfAB+EdukvI83gIBIA4NALO9Rar5/8ILdHHnaiaBBrpOEAxwpp/+mf6YBrhf/8NT/8MPwzfDH8MUcN+gK4fDU4AMAgegd5XuuF//wxOHwxuHwzP/ww8W98I3k5uPwzaPwAfCF8NXgBP/wzwCASAQDwDPuxXvk1+EFukvAD3vpA1w1/ldTR0NN/39cMAJXU0dDSAN/R+EUgbpIwcN74Srry4GT4ACHCACCXMCH4J28Qud7y4GUhIyLIz4WAygBzz0DOAfoCgGnPQM+Bz4HJcPsAXwOS8ALef/hngAXN1wItDXCwOpOADcIccA3CHTHyHdIcEDIoIQ/////byxkvI84AHwAfhHbpLyPN4=";
const abi = {
  "ABI version": 2,
  header: ["time"],
  functions: [
    {
      name: "constructor",
      inputs: [],
      outputs: []
    },
    {
      name: "sendTransaction",
      inputs: [
        {
          name: "dest",
          type: "address"
        },
        {
          name: "value",
          type: "uint128"
        },
        {
          name: "bounce",
          type: "bool"
        }
      ],
      outputs: []
    }
  ],
  data: [],
  events: []
};

export const walletPkg = {
  abi,
  imageBase64
};
