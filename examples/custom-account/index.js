const { errors: rpcErrors } = require('eth-json-rpc-errors')
const ethers = require('ethers');

const accounts = [];
updateUi();

wallet.registerRpcMessageHandler(async (_origin, req) => {
  switch (req.method) {
    case 'addAccount':
      addAccount(req.params);
      break;

    default:
      throw rpcErrors.methodNotFound(req)
  }

  updateUi();
  return true
})

wallet.registerAccountMessageHandler(async (origin, req) => {
  switch (req.method) {
    case 'eth_sign':
    case 'eth_signTransaction':
    case 'personal_sign':
    case 'wallet_signTypedData':
    case 'wallet_signTypedData_v3':
    case 'wallet_signTypedData_v4':
      console.log('origin, req', origin, req)

      let provider = new ethers.providers.Web3Provider(wallet);
      console.log('wallet', wallet);
      let walletWithProvider = new ethers.Wallet(wallet.getAppKey(), provider);
      // console.log('getAddress()', walletWithProvider.getAddress());
      console.log('works');

      let tx = {
          to: req.params[0].to,
          // We must pass in the amount as wei (1 ether = 1e18 wei), so we
          // use this convenience function to convert ether to wei.
          value: req.params[0].value
      };

      // let sendPromise = await walletEthers.sendTransaction(tx);
      // console.log("TX result", sendPromise);

      // const result = await prompt({ customHtml: `<div style="width: 100%;overflow-wrap: break-word;">
      //   Funds sent with tx hash: ${tx}. The site from <span style="font-weight: 900;color: #037DD6;"><a href="${origin}">${origin}</a></span> requests you sign this with your offline strategy:\n${JSON.stringify(req)}
      //   </div>`})

      const result = await prompt({ customHtml: `<div style="width: 100%;overflow-wrap: break-word;">
        The site from <span style="font-weight: 900;color: #037DD6;"><a href="${origin}">${origin}</a></span> requests you sign this with your offline strategy:\n${JSON.stringify(req)}
        </div>`})
      return 0
    default:
      throw rpcErrors.methodNotFound(req)
  }
})

async function addAccount (params) {
  validate(params);
  const account = params[0]
  const approved = await confirm(`Do you want to add offline account ${account} to your wallet?`)
  if (!approved) {
    throw rpcErrors.userRejectedRequest()
  }
  accounts.push(account);
  updateUi();
}

async function deposit (params) {
  validate(params);
  const account = params[0]
  const approved = await confirm(`Do you want to add offline account ${account} to your wallet?`)
  if (!approved) {
    throw rpcErrors.userRejectedRequest()
  }
  accounts.push(account);
  updateUi();
}

function validate (params) {
  if (params.length !== 1 || typeof params[0] !== 'string') {
    throw rpcErrors.invalidParams()
  }
}

async function confirm (message) {
  const response = await wallet.send({ method: 'confirm', params: [message] });
  return response.result;
}

async function prompt (message) {
  const response = await wallet.send({ method: 'prompt', params: [message] });
  return response.result;
}

function updateUi () {
  console.log('updating UI with accounts', accounts)
  accounts.forEach(async (account) => {
    console.log('issuing add for ', account)
    wallet.send({
      method: 'wallet_manageIdentities',
      params: [ 'add', { address: account }],
    })
    .catch((err) => console.log('Problem updating identity', err))
    .then((result) => {
      console.log('adding identity seems to have succeeded!')
    })
  })
}

