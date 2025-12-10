// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SupplyChain.sol";

/**
 * @title SupplyChainTest
 * @dev Tests completos para el contrato SupplyChain
 */
contract SupplyChainTest is Test {
    SupplyChain public supplyChain;

    // Direcciones de prueba
    address public admin;
    address public producer;
    address public factory;
    address public retailer;
    address public consumer;
    address public unauthorized;

    // Events para testing
    event UserRoleRequested(address indexed user, string role);
    event UserStatusChanged(address indexed user, SupplyChain.UserStatus status);
    event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, uint256 totalSupply);
    event TransferRequested(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount);
    event TransferAccepted(uint256 indexed transferId);
    event TransferRejected(uint256 indexed transferId);

    function setUp() public {
        // Configurar direcciones
        admin = address(this);
        producer = makeAddr("producer");
        factory = makeAddr("factory");
        retailer = makeAddr("retailer");
        consumer = makeAddr("consumer");
        unauthorized = makeAddr("unauthorized");

        // Desplegar contrato
        supplyChain = new SupplyChain();
    }

    // ========== TESTS DE GESTIÓN DE USUARIOS ==========

    function testUserRegistration() public {
        vm.prank(producer);
        vm.expectEmit(true, false, false, true);
        emit UserRoleRequested(producer, "Producer");
        supplyChain.requestUserRole("Producer");

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(user.userAddress, producer);
        assertEq(user.role, "Producer");
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending));
    }

    function testAdminApproveUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        vm.expectEmit(true, false, false, true);
        emit UserStatusChanged(producer, SupplyChain.UserStatus.Approved);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved));
    }

    function testAdminRejectUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Rejected);

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Rejected));
    }

    function testUserStatusChanges() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        // Pending -> Approved
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved));

        // Approved -> Rejected
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Rejected);
        user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Rejected));

        // Rejected -> Canceled
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Canceled);
        user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Canceled));
    }

    function testOnlyApprovedUsersCanOperate() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        // Intento crear token sin aprobación
        vm.prank(producer);
        vm.expectRevert("User not approved");
        supplyChain.createToken("Test Token", 100, "{}", 0);

        // Aprobar y volver a intentar
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Test Token", 100, "{}", 0);
    }

    function testGetUserInfo() public {
        vm.prank(factory);
        supplyChain.requestUserRole("Factory");

        SupplyChain.User memory user = supplyChain.getUserInfo(factory);
        assertEq(user.id, 1);
        assertEq(user.userAddress, factory);
        assertEq(user.role, "Factory");
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending));
    }

    function testIsAdmin() public view {
        assertTrue(supplyChain.isAdmin(admin));
        assertFalse(supplyChain.isAdmin(producer));
    }

    function testCannotRegisterTwice() public {
        vm.startPrank(producer);
        supplyChain.requestUserRole("Producer");

        vm.expectRevert("User already registered");
        supplyChain.requestUserRole("Factory");
        vm.stopPrank();
    }

    function testInvalidRole() public {
        vm.prank(producer);
        vm.expectRevert("Invalid role");
        supplyChain.requestUserRole("InvalidRole");
    }

    // ========== TESTS DE CREACIÓN DE TOKENS ==========

    function testCreateTokenByProducer() public {
        // Registrar y aprobar producer
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        // Crear token
        vm.prank(producer);
        vm.expectEmit(true, true, false, true);
        emit TokenCreated(1, producer, "Raw Material", 1000);
        supplyChain.createToken("Raw Material", 1000, '{"type":"cotton"}', 0);

        // Verificar token
        (uint256 id, address creator, string memory name, uint256 totalSupply, , uint256 parentId,) =
            supplyChain.getToken(1);

        assertEq(id, 1);
        assertEq(creator, producer);
        assertEq(name, "Raw Material");
        assertEq(totalSupply, 1000);
        assertEq(parentId, 0);
    }

    function testCreateTokenByFactory() public {
        // Setup: Producer crea materia prima
        _setupAndApproveUser(producer, "Producer");
        vm.prank(producer);
        supplyChain.createToken("Cotton", 1000, '{"type":"raw"}', 0);

        // Transferir a factory
        _setupAndApproveUser(factory, "Factory");
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);
        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // Factory crea producto derivado
        vm.prank(factory);
        supplyChain.createToken("T-Shirt", 50, '{"color":"blue"}', 1);

        (uint256 id, , string memory name, , , uint256 parentId,) =
            supplyChain.getToken(2);

        assertEq(id, 2);
        assertEq(name, "T-Shirt");
        assertEq(parentId, 1);
    }

    function testCreateTokenByRetailer() public {
        // Setup cadena completa
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");
        _setupAndApproveUser(retailer, "Retailer");

        // Producer crea y transfiere a Factory
        vm.prank(producer);
        supplyChain.createToken("Cotton", 1000, "{}", 0);
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);
        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // Factory crea producto
        vm.prank(factory);
        supplyChain.createToken("T-Shirt", 50, "{}", 1);

        // Factory transfiere a Retailer
        vm.prank(factory);
        supplyChain.transfer(retailer, 2, 10);
        vm.prank(retailer);
        supplyChain.acceptTransfer(2);

        // Retailer puede crear token derivado
        vm.prank(retailer);
        supplyChain.createToken("Packaged T-Shirt", 10, '{"packaged":true}', 2);

        (uint256 id, , , , , uint256 parentId,) = supplyChain.getToken(3);
        assertEq(id, 3);
        assertEq(parentId, 2);
    }

    function testTokenWithParentId() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Raw Material", 1000, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);
        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        vm.prank(factory);
        supplyChain.createToken("Product", 50, "{}", 1);

        (, , , , , uint256 parentId,) = supplyChain.getToken(2);
        assertEq(parentId, 1);
    }

    function testTokenMetadata() public {
        _setupAndApproveUser(producer, "Producer");

        string memory features = '{"color":"red","weight":"100kg"}';
        vm.prank(producer);
        supplyChain.createToken("Product", 100, features, 0);

        (, , , , string memory returnedFeatures, ,) = supplyChain.getToken(1);
        assertEq(returnedFeatures, features);
    }

    function testTokenBalance() public {
        _setupAndApproveUser(producer, "Producer");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        uint256 balance = supplyChain.getTokenBalance(1, producer);
        assertEq(balance, 1000);
    }

    function testGetToken() public {
        _setupAndApproveUser(producer, "Producer");

        vm.prank(producer);
        supplyChain.createToken("Test Token", 500, '{"test":true}', 0);

        (uint256 id, address creator, string memory name, uint256 totalSupply,
         string memory features, uint256 parentId, uint256 dateCreated) =
            supplyChain.getToken(1);

        assertEq(id, 1);
        assertEq(creator, producer);
        assertEq(name, "Test Token");
        assertEq(totalSupply, 500);
        assertEq(features, '{"test":true}');
        assertEq(parentId, 0);
        assertGt(dateCreated, 0);
    }

    function testGetUserTokens() public {
        _setupAndApproveUser(producer, "Producer");

        vm.startPrank(producer);
        supplyChain.createToken("Token1", 100, "{}", 0);
        supplyChain.createToken("Token2", 200, "{}", 0);
        supplyChain.createToken("Token3", 300, "{}", 0);
        vm.stopPrank();

        uint256[] memory tokens = supplyChain.getUserTokens(producer);
        assertEq(tokens.length, 3);
        assertEq(tokens[0], 1);
        assertEq(tokens[1], 2);
        assertEq(tokens[2], 3);
    }

    function testProducerCannotCreateWithParent() public {
        _setupAndApproveUser(producer, "Producer");

        vm.prank(producer);
        vm.expectRevert("Producers can only create raw materials");
        supplyChain.createToken("Invalid", 100, "{}", 1);
    }

    function testConsumerCannotCreateToken() public {
        _setupAndApproveUser(consumer, "Consumer");

        vm.prank(consumer);
        vm.expectRevert("Consumers cannot create tokens");
        supplyChain.createToken("Invalid", 100, "{}", 0);
    }

    // ========== TESTS DE TRANSFERENCIAS ==========

    function testTransferFromProducerToFactory() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Raw Material", 1000, "{}", 0);

        vm.prank(producer);
        vm.expectEmit(true, true, true, true);
        emit TransferRequested(1, producer, factory, 1, 100);
        supplyChain.transfer(factory, 1, 100);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(t.from, producer);
        assertEq(t.to, factory);
        assertEq(t.tokenId, 1);
        assertEq(t.amount, 100);
        assertEq(uint(t.status), uint(SupplyChain.TransferStatus.Pending));
    }

    function testTransferFromFactoryToRetailer() public {
        _setupCompleteChain();

        vm.prank(producer);
        supplyChain.createToken("Raw", 1000, "{}", 0);
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);
        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        vm.prank(factory);
        supplyChain.createToken("Product", 50, "{}", 1);

        vm.prank(factory);
        supplyChain.transfer(retailer, 2, 10);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(2);
        assertEq(t.from, factory);
        assertEq(t.to, retailer);
    }

    function testTransferFromRetailerToConsumer() public {
        _setupCompleteChain();
        _createAndTransferToRetailer();

        vm.prank(retailer);
        supplyChain.transfer(consumer, 2, 5);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(3);
        assertEq(t.from, retailer);
        assertEq(t.to, consumer);
    }

    function testAcceptTransfer() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);

        uint256 balanceBefore = supplyChain.getTokenBalance(1, factory);
        assertEq(balanceBefore, 0);

        vm.prank(factory);
        vm.expectEmit(true, false, false, false);
        emit TransferAccepted(1);
        supplyChain.acceptTransfer(1);

        uint256 balanceAfter = supplyChain.getTokenBalance(1, factory);
        assertEq(balanceAfter, 100);

        uint256 producerBalance = supplyChain.getTokenBalance(1, producer);
        assertEq(producerBalance, 900);
    }

    function testRejectTransfer() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);

        vm.prank(factory);
        vm.expectEmit(true, false, false, false);
        emit TransferRejected(1);
        supplyChain.rejectTransfer(1);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(uint(t.status), uint(SupplyChain.TransferStatus.Rejected));

        // Los balances no deben cambiar
        assertEq(supplyChain.getTokenBalance(1, producer), 1000);
        assertEq(supplyChain.getTokenBalance(1, factory), 0);
    }

    function testTransferInsufficientBalance() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        vm.expectRevert("Insufficient balance");
        supplyChain.transfer(factory, 1, 2000);
    }

    function testGetTransfer() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(t.id, 1);
        assertEq(t.from, producer);
        assertEq(t.to, factory);
        assertEq(t.tokenId, 1);
        assertEq(t.amount, 100);
        assertEq(uint(t.status), uint(SupplyChain.TransferStatus.Pending));
    }

    function testGetUserTransfers() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.startPrank(producer);
        supplyChain.transfer(factory, 1, 100);
        supplyChain.transfer(factory, 1, 200);
        vm.stopPrank();

        uint256[] memory transfers = supplyChain.getUserTransfers(producer);
        assertEq(transfers.length, 2);
        assertEq(transfers[0], 1);
        assertEq(transfers[1], 2);
    }

    // ========== TESTS DE VALIDACIONES Y PERMISOS ==========

    function testInvalidRoleTransfer() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(retailer, "Retailer");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        vm.expectRevert("Producer can only transfer to Factory");
        supplyChain.transfer(retailer, 1, 100);
    }

    function testUnapprovedUserCannotCreateToken() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        vm.prank(producer);
        vm.expectRevert("User not approved");
        supplyChain.createToken("Token", 100, "{}", 0);
    }

    function testUnapprovedUserCannotTransfer() public {
        _setupAndApproveUser(producer, "Producer");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");

        vm.prank(producer);
        vm.expectRevert("Recipient not approved");
        supplyChain.transfer(factory, 1, 100);
    }

    function testOnlyAdminCanChangeStatus() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        vm.prank(unauthorized);
        vm.expectRevert("Only admin can perform this action");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
    }

    function testConsumerCannotTransfer() public {
        _setupCompleteChain();
        _createAndTransferToRetailer();

        vm.prank(retailer);
        supplyChain.transfer(consumer, 2, 5);
        vm.prank(consumer);
        supplyChain.acceptTransfer(3);

        address consumer2 = makeAddr("consumer2");
        vm.prank(consumer2);
        supplyChain.requestUserRole("Consumer");
        supplyChain.changeStatusUser(consumer2, SupplyChain.UserStatus.Approved);

        vm.prank(consumer);
        vm.expectRevert("Consumer cannot transfer tokens");
        supplyChain.transfer(consumer2, 2, 1);
    }

    function testTransferToSameAddress() public {
        _setupAndApproveUser(producer, "Producer");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        vm.expectRevert("Cannot transfer to yourself");
        supplyChain.transfer(producer, 1, 100);
    }

    // ========== TESTS DE CASOS EDGE ==========

    function testTransferZeroAmount() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        vm.expectRevert("Amount must be greater than 0");
        supplyChain.transfer(factory, 1, 0);
    }

    function testTransferNonExistentToken() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        vm.expectRevert("Token does not exist");
        supplyChain.transfer(factory, 999, 100);
    }

    function testAcceptNonExistentTransfer() public {
        _setupAndApproveUser(factory, "Factory");

        vm.prank(factory);
        vm.expectRevert("Transfer does not exist");
        supplyChain.acceptTransfer(999);
    }

    function testDoubleAcceptTransfer() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        vm.prank(factory);
        vm.expectRevert("Transfer not pending");
        supplyChain.acceptTransfer(1);
    }

    function testTransferAfterRejection() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);

        vm.prank(factory);
        supplyChain.rejectTransfer(1);

        // Puede crear una nueva transferencia después del rechazo
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 50);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(2);
        assertEq(t.amount, 50);
        assertEq(uint(t.status), uint(SupplyChain.TransferStatus.Pending));
    }

    function testCreateTokenZeroSupply() public {
        _setupAndApproveUser(producer, "Producer");

        vm.prank(producer);
        vm.expectRevert("Total supply must be greater than 0");
        supplyChain.createToken("Token", 0, "{}", 0);
    }

    function testGetNonExistentToken() public {
        vm.expectRevert("Token does not exist");
        supplyChain.getToken(999);
    }

    function testGetNonExistentUser() public {
        vm.expectRevert("User not found");
        supplyChain.getUserInfo(unauthorized);
    }

    function testTransferToZeroAddress() public {
        _setupAndApproveUser(producer, "Producer");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        vm.expectRevert("Cannot transfer to zero address");
        supplyChain.transfer(address(0), 1, 100);
    }

    function testTransferToUnregisteredUser() public {
        _setupAndApproveUser(producer, "Producer");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        vm.expectRevert("Recipient not registered");
        supplyChain.transfer(unauthorized, 1, 100);
    }

    function testOnlyRecipientCanAccept() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);

        vm.prank(producer);
        vm.expectRevert("Only recipient can accept");
        supplyChain.acceptTransfer(1);
    }

    function testOnlyRecipientCanReject() public {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");

        vm.prank(producer);
        supplyChain.createToken("Token", 1000, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 100);

        vm.prank(producer);
        vm.expectRevert("Only recipient can reject");
        supplyChain.rejectTransfer(1);
    }

    // ========== TESTS DE FLUJO COMPLETO ==========

    function testCompleteSupplyChainFlow() public {
        // Setup todos los usuarios
        _setupCompleteChain();

        // 1. Producer crea materia prima
        vm.prank(producer);
        supplyChain.createToken("Cotton", 1000, '{"type":"raw"}', 0);
        assertEq(supplyChain.getTokenBalance(1, producer), 1000);

        // 2. Producer -> Factory
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
        assertEq(supplyChain.getTokenBalance(1, factory), 500);
        assertEq(supplyChain.getTokenBalance(1, producer), 500);

        // 3. Factory crea producto
        vm.prank(factory);
        supplyChain.createToken("T-Shirt", 100, '{"color":"blue"}', 1);
        assertEq(supplyChain.getTokenBalance(2, factory), 100);

        // 4. Factory -> Retailer
        vm.prank(factory);
        supplyChain.transfer(retailer, 2, 50);
        vm.prank(retailer);
        supplyChain.acceptTransfer(2);
        assertEq(supplyChain.getTokenBalance(2, retailer), 50);

        // 5. Retailer -> Consumer
        vm.prank(retailer);
        supplyChain.transfer(consumer, 2, 10);
        vm.prank(consumer);
        supplyChain.acceptTransfer(3);
        assertEq(supplyChain.getTokenBalance(2, consumer), 10);

        // Verificar trazabilidad
        (, , , , , uint256 parentId,) = supplyChain.getToken(2);
        assertEq(parentId, 1);
    }

    function testMultipleTokensFlow() public {
        _setupCompleteChain();

        // Producer crea múltiples materias primas
        vm.startPrank(producer);
        supplyChain.createToken("Cotton", 1000, "{}", 0);
        supplyChain.createToken("Polyester", 800, "{}", 0);
        supplyChain.createToken("Dye", 500, "{}", 0);
        vm.stopPrank();

        uint256[] memory producerTokens = supplyChain.getUserTokens(producer);
        assertEq(producerTokens.length, 3);

        // Transferir todos a factory
        vm.startPrank(producer);
        supplyChain.transfer(factory, 1, 100);
        supplyChain.transfer(factory, 2, 100);
        supplyChain.transfer(factory, 3, 100);
        vm.stopPrank();

        vm.startPrank(factory);
        supplyChain.acceptTransfer(1);
        supplyChain.acceptTransfer(2);
        supplyChain.acceptTransfer(3);
        vm.stopPrank();

        assertEq(supplyChain.getTokenBalance(1, factory), 100);
        assertEq(supplyChain.getTokenBalance(2, factory), 100);
        assertEq(supplyChain.getTokenBalance(3, factory), 100);
    }

    function testTraceabilityFlow() public {
        _setupCompleteChain();

        // Crear cadena de tokens con parentId
        vm.prank(producer);
        supplyChain.createToken("Raw Cotton", 1000, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        vm.prank(factory);
        supplyChain.createToken("Fabric", 200, "{}", 1);

        vm.prank(factory);
        supplyChain.transfer(retailer, 2, 100);
        vm.prank(retailer);
        supplyChain.acceptTransfer(2);

        vm.prank(retailer);
        supplyChain.createToken("Packaged Fabric", 100, "{}", 2);

        // Verificar cadena de trazabilidad
        (, , , , , uint256 parent2,) = supplyChain.getToken(2);
        assertEq(parent2, 1); // Fabric viene de Raw Cotton

        (, , , , , uint256 parent3,) = supplyChain.getToken(3);
        assertEq(parent3, 2); // Packaged viene de Fabric

        // Rastrear origen
        (, , string memory originName, , , ,) = supplyChain.getToken(1);
        assertEq(originName, "Raw Cotton");
    }

    // ========== HELPER FUNCTIONS ==========

    function _setupAndApproveUser(address user, string memory role) internal {
        vm.prank(user);
        supplyChain.requestUserRole(role);
        supplyChain.changeStatusUser(user, SupplyChain.UserStatus.Approved);
    }

    function _setupCompleteChain() internal {
        _setupAndApproveUser(producer, "Producer");
        _setupAndApproveUser(factory, "Factory");
        _setupAndApproveUser(retailer, "Retailer");
        _setupAndApproveUser(consumer, "Consumer");
    }

    function _createAndTransferToRetailer() internal {
        vm.prank(producer);
        supplyChain.createToken("Raw", 1000, "{}", 0);

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        vm.prank(factory);
        supplyChain.createToken("Product", 100, "{}", 1);

        vm.prank(factory);
        supplyChain.transfer(retailer, 2, 50);
        vm.prank(retailer);
        supplyChain.acceptTransfer(2);
    }
}
