// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

/**
 * @title DeploySupplyChain
 * @dev Script para desplegar el contrato SupplyChain
 */
contract DeploySupplyChain is Script {
    function run() external {
        // Obtener la private key del deployer desde el environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Iniciar broadcasting de transacciones
        vm.startBroadcast(deployerPrivateKey);

        // Desplegar el contrato SupplyChain
        SupplyChain supplyChain = new SupplyChain();

        // Log de la dirección del contrato desplegado
        console.log("SupplyChain deployed at:", address(supplyChain));
        console.log("Admin address:", supplyChain.admin());

        // Detener broadcasting
        vm.stopBroadcast();
    }
}
