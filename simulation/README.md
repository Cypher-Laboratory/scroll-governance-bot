Deploy a dummy contract and fire on-demand events to test the bot

deploy: 
```bash
forge script script/Deploy.s.sol --rpc-url "rpc_url" --broadcast --private-key "private_key" 
```

fireEvent
```bash
forge script script/FireEvent.s.sol --rpc-url "rpc_url" --broadcast --private-key "private_key" 
```
> Don't forget to update the governance contract address in the fireEvent script before running it.

