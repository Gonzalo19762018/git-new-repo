// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SupplyChain
 * @dev Smart contract para gestionar la trazabilidad de cadenas de suministro
 * con roles específicos: Producer, Factory, Retailer, Consumer y Admin
 */
contract SupplyChain {
    // ========== ENUMS ==========

    enum UserStatus {
        Pending,    // Usuario solicitó rol pero aún no fue aprobado
        Approved,   // Usuario aprobado por admin
        Rejected,   // Usuario rechazado por admin
        Canceled    // Usuario canceló su solicitud
    }

    enum TransferStatus {
        Pending,    // Transferencia iniciada, esperando aceptación
        Accepted,   // Transferencia aceptada por el receptor
        Rejected    // Transferencia rechazada por el receptor
    }

    // ========== STRUCTS ==========

    struct Token {
        uint256 id;
        address creator;
        string name;
        uint256 totalSupply;
        string features;        // JSON string con metadatos del producto
        uint256 parentId;       // ID del token padre (0 si es materia prima)
        uint256 dateCreated;
    }

    struct Transfer {
        uint256 id;
        address from;
        address to;
        uint256 tokenId;
        uint256 dateCreated;
        uint256 amount;
        TransferStatus status;
    }

    struct User {
        uint256 id;
        address userAddress;
        string role;            // "Producer", "Factory", "Retailer", "Consumer"
        UserStatus status;
    }

    // ========== STATE VARIABLES ==========

    address public admin;

    // Contadores para IDs únicos
    uint256 public nextTokenId = 1;
    uint256 public nextTransferId = 1;
    uint256 public nextUserId = 1;

    // Mappings principales
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => Transfer) public transfers;
    mapping(uint256 => User) public users;
    mapping(address => uint256) public addressToUserId;

    // Balances: tokenId => (address => balance)
    mapping(uint256 => mapping(address => uint256)) private tokenBalances;

    // Arrays auxiliares para búsquedas
    mapping(address => uint256[]) private userTokenIds;
    mapping(address => uint256[]) private userTransferIds;

    // ========== EVENTS ==========

    event TokenCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        uint256 totalSupply
    );

    event TransferRequested(
        uint256 indexed transferId,
        address indexed from,
        address indexed to,
        uint256 tokenId,
        uint256 amount
    );

    event TransferAccepted(uint256 indexed transferId);
    event TransferRejected(uint256 indexed transferId);
    event UserRoleRequested(address indexed user, string role);
    event UserStatusChanged(address indexed user, UserStatus status);

    // ========== MODIFIERS ==========

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyApprovedUser() {
        require(addressToUserId[msg.sender] != 0, "User not registered");
        require(
            users[addressToUserId[msg.sender]].status == UserStatus.Approved,
            "User not approved"
        );
        _;
    }

    modifier validRole(string memory role) {
        require(
            keccak256(bytes(role)) == keccak256(bytes("Producer")) ||
            keccak256(bytes(role)) == keccak256(bytes("Factory")) ||
            keccak256(bytes(role)) == keccak256(bytes("Retailer")) ||
            keccak256(bytes(role)) == keccak256(bytes("Consumer")),
            "Invalid role"
        );
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor() {
        admin = msg.sender;
    }

    // ========== USER MANAGEMENT FUNCTIONS ==========

    /**
     * @dev Permite a un usuario solicitar un rol en el sistema
     * @param role El rol solicitado ("Producer", "Factory", "Retailer", "Consumer")
     */
    function requestUserRole(string memory role) public validRole(role) {
        require(addressToUserId[msg.sender] == 0, "User already registered");

        uint256 userId = nextUserId++;

        users[userId] = User({
            id: userId,
            userAddress: msg.sender,
            role: role,
            status: UserStatus.Pending
        });

        addressToUserId[msg.sender] = userId;

        emit UserRoleRequested(msg.sender, role);
    }

    /**
     * @dev Permite al admin cambiar el estado de un usuario
     * @param userAddress Dirección del usuario
     * @param newStatus Nuevo estado del usuario
     */
    function changeStatusUser(address userAddress, UserStatus newStatus)
        public
        onlyAdmin
    {
        uint256 userId = addressToUserId[userAddress];
        require(userId != 0, "User not found");

        users[userId].status = newStatus;

        emit UserStatusChanged(userAddress, newStatus);
    }

    /**
     * @dev Obtiene la información de un usuario
     * @param userAddress Dirección del usuario
     * @return User struct con la información del usuario
     */
    function getUserInfo(address userAddress) public view returns (User memory) {
        uint256 userId = addressToUserId[userAddress];
        require(userId != 0, "User not found");
        return users[userId];
    }

    /**
     * @dev Verifica si una dirección es el admin
     * @param userAddress Dirección a verificar
     * @return true si es admin, false en caso contrario
     */
    function isAdmin(address userAddress) public view returns (bool) {
        return userAddress == admin;
    }

    // ========== TOKEN MANAGEMENT FUNCTIONS ==========

    /**
     * @dev Crea un nuevo token
     * @param name Nombre del token/producto
     * @param totalSupply Cantidad total del token
     * @param features JSON string con características del producto
     * @param parentId ID del token padre (0 si es materia prima)
     */
    function createToken(
        string memory name,
        uint256 totalSupply,
        string memory features,
        uint256 parentId
    ) public onlyApprovedUser {
        require(totalSupply > 0, "Total supply must be greater than 0");

        uint256 userId = addressToUserId[msg.sender];
        string memory userRole = users[userId].role;

        // Validaciones según rol
        if (keccak256(bytes(userRole)) == keccak256(bytes("Producer"))) {
            require(parentId == 0, "Producers can only create raw materials");
        } else if (
            keccak256(bytes(userRole)) == keccak256(bytes("Factory")) ||
            keccak256(bytes(userRole)) == keccak256(bytes("Retailer"))
        ) {
            if (parentId != 0) {
                require(parentId < nextTokenId, "Parent token does not exist");
                require(
                    tokenBalances[parentId][msg.sender] > 0,
                    "Must own parent token to create derived product"
                );
            }
        } else {
            revert("Consumers cannot create tokens");
        }

        uint256 tokenId = nextTokenId++;

        tokens[tokenId] = Token({
            id: tokenId,
            creator: msg.sender,
            name: name,
            totalSupply: totalSupply,
            features: features,
            parentId: parentId,
            dateCreated: block.timestamp
        });

        tokenBalances[tokenId][msg.sender] = totalSupply;
        userTokenIds[msg.sender].push(tokenId);

        emit TokenCreated(tokenId, msg.sender, name, totalSupply);
    }

    /**
     * @dev Obtiene la información de un token
     * @param tokenId ID del token
     * @return id ID del token
     * @return creator Dirección del creador
     * @return name Nombre del token
     * @return totalSupply Suministro total
     * @return features Características del token
     * @return parentId ID del token padre
     * @return dateCreated Fecha de creación
     */
    function getToken(uint256 tokenId) public view returns (
        uint256 id,
        address creator,
        string memory name,
        uint256 totalSupply,
        string memory features,
        uint256 parentId,
        uint256 dateCreated
    ) {
        require(tokenId > 0 && tokenId < nextTokenId, "Token does not exist");
        Token storage token = tokens[tokenId];
        return (
            token.id,
            token.creator,
            token.name,
            token.totalSupply,
            token.features,
            token.parentId,
            token.dateCreated
        );
    }

    /**
     * @dev Obtiene el balance de un token para un usuario específico
     * @param tokenId ID del token
     * @param userAddress Dirección del usuario
     * @return Balance del token
     */
    function getTokenBalance(uint256 tokenId, address userAddress)
        public
        view
        returns (uint256)
    {
        require(tokenId > 0 && tokenId < nextTokenId, "Token does not exist");
        return tokenBalances[tokenId][userAddress];
    }

    /**
     * @dev Obtiene todos los IDs de tokens que posee un usuario
     * @param userAddress Dirección del usuario
     * @return Array de IDs de tokens
     */
    function getUserTokens(address userAddress)
        public
        view
        returns (uint256[] memory)
    {
        return userTokenIds[userAddress];
    }

    // ========== TRANSFER FUNCTIONS ==========

    /**
     * @dev Inicia una transferencia de tokens
     * @param to Dirección del receptor
     * @param tokenId ID del token a transferir
     * @param amount Cantidad a transferir
     */
    function transfer(address to, uint256 tokenId, uint256 amount)
        public
        onlyApprovedUser
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(to != msg.sender, "Cannot transfer to yourself");
        require(tokenId > 0 && tokenId < nextTokenId, "Token does not exist");
        require(amount > 0, "Amount must be greater than 0");
        require(
            tokenBalances[tokenId][msg.sender] >= amount,
            "Insufficient balance"
        );

        // Validar que el receptor está registrado y aprobado
        uint256 toUserId = addressToUserId[to];
        require(toUserId != 0, "Recipient not registered");
        require(
            users[toUserId].status == UserStatus.Approved,
            "Recipient not approved"
        );

        // Validar flujo según roles
        uint256 fromUserId = addressToUserId[msg.sender];
        string memory fromRole = users[fromUserId].role;
        string memory toRole = users[toUserId].role;

        _validateTransferFlow(fromRole, toRole);

        // Crear transferencia pendiente
        uint256 transferId = nextTransferId++;

        transfers[transferId] = Transfer({
            id: transferId,
            from: msg.sender,
            to: to,
            tokenId: tokenId,
            dateCreated: block.timestamp,
            amount: amount,
            status: TransferStatus.Pending
        });

        userTransferIds[msg.sender].push(transferId);
        userTransferIds[to].push(transferId);

        emit TransferRequested(transferId, msg.sender, to, tokenId, amount);
    }

    /**
     * @dev Acepta una transferencia pendiente
     * @param transferId ID de la transferencia
     */
    function acceptTransfer(uint256 transferId) public {
        require(
            transferId > 0 && transferId < nextTransferId,
            "Transfer does not exist"
        );

        Transfer storage t = transfers[transferId];
        require(t.to == msg.sender, "Only recipient can accept");
        require(
            t.status == TransferStatus.Pending,
            "Transfer not pending"
        );
        require(
            tokenBalances[t.tokenId][t.from] >= t.amount,
            "Sender has insufficient balance"
        );

        // Ejecutar transferencia
        tokenBalances[t.tokenId][t.from] -= t.amount;
        tokenBalances[t.tokenId][t.to] += t.amount;

        // Agregar token a la lista del receptor si es la primera vez
        if (tokenBalances[t.tokenId][t.to] == t.amount) {
            userTokenIds[t.to].push(t.tokenId);
        }

        t.status = TransferStatus.Accepted;

        emit TransferAccepted(transferId);
    }

    /**
     * @dev Rechaza una transferencia pendiente
     * @param transferId ID de la transferencia
     */
    function rejectTransfer(uint256 transferId) public {
        require(
            transferId > 0 && transferId < nextTransferId,
            "Transfer does not exist"
        );

        Transfer storage t = transfers[transferId];
        require(t.to == msg.sender, "Only recipient can reject");
        require(
            t.status == TransferStatus.Pending,
            "Transfer not pending"
        );

        t.status = TransferStatus.Rejected;

        emit TransferRejected(transferId);
    }

    /**
     * @dev Obtiene la información de una transferencia
     * @param transferId ID de la transferencia
     * @return Transfer struct
     */
    function getTransfer(uint256 transferId)
        public
        view
        returns (Transfer memory)
    {
        require(
            transferId > 0 && transferId < nextTransferId,
            "Transfer does not exist"
        );
        return transfers[transferId];
    }

    /**
     * @dev Obtiene todos los IDs de transferencias de un usuario
     * @param userAddress Dirección del usuario
     * @return Array de IDs de transferencias
     */
    function getUserTransfers(address userAddress)
        public
        view
        returns (uint256[] memory)
    {
        return userTransferIds[userAddress];
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @dev Valida que el flujo de transferencia sea correcto según los roles
     * @param fromRole Rol del remitente
     * @param toRole Rol del receptor
     */
    function _validateTransferFlow(
        string memory fromRole,
        string memory toRole
    ) internal pure {
        bytes32 fromHash = keccak256(bytes(fromRole));
        bytes32 toHash = keccak256(bytes(toRole));

        if (fromHash == keccak256(bytes("Producer"))) {
            require(
                toHash == keccak256(bytes("Factory")),
                "Producer can only transfer to Factory"
            );
        } else if (fromHash == keccak256(bytes("Factory"))) {
            require(
                toHash == keccak256(bytes("Retailer")),
                "Factory can only transfer to Retailer"
            );
        } else if (fromHash == keccak256(bytes("Retailer"))) {
            require(
                toHash == keccak256(bytes("Consumer")),
                "Retailer can only transfer to Consumer"
            );
        } else if (fromHash == keccak256(bytes("Consumer"))) {
            revert("Consumer cannot transfer tokens");
        }
    }
}
