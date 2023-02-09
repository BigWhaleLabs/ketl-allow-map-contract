//                                                                        ,-,
//                            *                      .                   /.(              .
//                                       \|/                             \ {
//    .                 _    .  ,   .    -*-       .                      `-`
//     ,'-.         *  / \_ *  / \_      /|\         *   /\'__        *.                 *
//    (____".         /    \  /    \,     __      .    _/  /  \  * .               .
//               .   /\/\  /\/ :' __ \_  /  \       _^/  ^/    `—./\    /\   .
//   *       _      /    \/  \  _/  \-‘\/  ` \ /\  /.' ^_   \_   .’\\  /_/\           ,'-.
//          /_\   /\  .-   `. \/     \ /.     /  \ ;.  _/ \ -. `_/   \/.   \   _     (____".    *
//     .   /   \ /  `-.__ ^   / .-'.--\      -    \/  _ `--./ .-'  `-/.     \ / \             .
//        /     /.       `.  / /       `.   /   `  .-'      '-._ `._         /.  \
// ~._,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'
// ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~~
// ~~    ~~~~    ~~~~     ~~~~   ~~~~    ~~~~    ~~~~    ~~~~    ~~~~    ~~~~    ~~~~    ~~~~    ~~
//     ~~     ~~      ~~      ~~      ~~      ~~      ~~      ~~       ~~     ~~      ~~      ~~
//                          ๐
//                                                                              _
//                                                  ₒ                         ><_>
//                                  _______     __      _______
//          .-'                    |   _  "\   |" \    /" _   "|                               ๐
//     '--./ /     _.---.          (. |_)  :)  ||  |  (: ( \___)
//     '-,  (__..-`       \        |:     \/   |:  |   \/ \
//        \          .     |       (|  _  \\   |.  |   //  \ ___
//         `,.__.   ,__.--/        |: |_)  :)  |\  |   (:   _(  _|
//           '._/_.'___.-`         (_______/   |__\|    \_______)                 ๐
//
//                  __   __  ___   __    __         __       ___         _______
//                 |"  |/  \|  "| /" |  | "\       /""\     |"  |       /"     "|
//      ๐          |'  /    \:  |(:  (__)  :)     /    \    ||  |      (: ______)
//                 |: /'        | \/      \/     /' /\  \   |:  |   ₒ   \/    |
//                  \//  /\'    | //  __  \\    //  __'  \   \  |___    // ___)_
//                  /   /  \\   |(:  (  )  :)  /   /  \\  \ ( \_|:  \  (:      "|
//                 |___/    \___| \__|  |__/  (___/    \___) \_______)  \_______)
//                                                                                     ₒ৹
//                          ___             __       _______     ________
//         _               |"  |     ₒ     /""\     |   _  "\   /"       )
//       ><_>              ||  |          /    \    (. |_)  :) (:   \___/
//                         |:  |         /' /\  \   |:     \/   \___  \
//                          \  |___     //  __'  \  (|  _  \\    __/  \\          \_____)\_____
//                         ( \_|:  \   /   /  \\  \ |: |_)  :)  /" \   :)         /--v____ __`<
//                          \_______) (___/    \___)(_______/  (_______/                  )/
//                                                                                        '
//
//            ๐                          .    '    ,                                           ₒ
//                         ₒ               _______
//                                 ____  .`_|___|_`.  ____
//                                        \ \   / /                        ₒ৹
//                                          \ ' /                         ๐
//   ₒ                                        \/
//                                   ₒ     /      \       )                                 (
//           (   ₒ৹               (                      (                                  )
//            )                   )               _      )                )                (
//           (        )          (       (      ><_>    (       (        (                  )
//     )      )      (     (      )       )              )       )        )         )      (
//    (      (        )     )    (       (              (       (        (         (        )
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@big-whale-labs/versioned-contract/contracts/Versioned.sol";
import "@zk-kit/incremental-merkle-tree.sol/IncrementalBinaryTree.sol";
import "./WhitelistCheckerVerifier.sol";

contract KetlWhitelist is Versioned {
  using Counters for Counters.Counter;
  using IncrementalBinaryTree for IncrementalTreeData;

  // State
  address public verifierContract;

  mapping(uint256 => bool) public nullifierMap;
  mapping(address => bool) public allowMap;

  uint256[] public tokenHashes;
  mapping(bytes32 => bool) public merkleRootMap;
  IncrementalTreeData public tokenHashesTree;

  // Events
  event TokenHashesAdded(uint256[] tokenHashes, bytes32 newMerkleRoot);
  event AddressAddedToAllowMap(address indexed _address);

  // Functions
  constructor(
    string memory _version,
    address _verifierContract,
    uint8 _depth
  ) Versioned(_version) {
    verifierContract = _verifierContract;
    tokenHashesTree.init(_depth, 0);
  }

  function addAddressToAllowMap(
    address _address,
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[2] memory input
  ) public {
    // Check the proof
    require(
      WhitelistCheckerVerifier(verifierContract).verifyProof(a, b, c, input),
      "Invalid ZK proof"
    );
    // Check the nullifier
    require(!nullifierMap[input[1]], "Nullifier has already been used");
    // Check the merkle root
    require(merkleRootMap[bytes32(input[0])], "Merkle root is not valid");
    // Add the address to the allow map
    allowMap[_address] = true;
    nullifierMap[input[1]] = true;
    emit AddressAddedToAllowMap(_address);
  }

  function isAddressAllowed(address _address) public view returns (bool) {
    return allowMap[_address];
  }

  function addTokenHashes(uint256[] memory _tokenHashes) public {
    for (uint256 i = 0; i < _tokenHashes.length; i++) {
      // Add the token hashes to the tree
      tokenHashesTree.insert(_tokenHashes[i]);
      // Add the token hashes to the token hashes array
      tokenHashes.push(_tokenHashes[i]);
    }
    // Add the merkle root to the merkle root map
    bytes32 merkleRoot = bytes32(tokenHashesTree.root);
    merkleRootMap[merkleRoot] = true;
    emit TokenHashesAdded(_tokenHashes, merkleRoot);
  }
}
