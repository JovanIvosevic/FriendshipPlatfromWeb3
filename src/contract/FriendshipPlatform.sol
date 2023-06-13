// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract FriendshipPlatform{
    struct User{
        uint id;
        address my_address;
        string name;
        address[] friends_list;
        address[] friend_requests_list;
    }

    mapping(address => User) public users; //objekat sa adresama koji su kljucevi i useri koji su vrednosti
    mapping(uint => address) public id_addresses_link;
    uint user_count = 0;

    event userRegistered(address _adress); //provera da li je prosla funkcija
    event requestSent(address _adress);
    event requestAccepted(address _adress);
    
    //pomocna funkcija za brisanje iz niza
    function removeValue(address[] storage arr, address value) internal { //storage za trajnu memoriju niza
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
        }
    }

    //pure gleda samo lokalne promenljive unutar te funkcije i sluzi za optimizaciju gasa da manje trosi

    function checkValueNotInArray(address[] memory arr, address value) internal pure returns (bool) { //memory za privremenu memoriju niza
    for (uint256 i = 0; i < arr.length; i++) {
        if (arr[i] == value) {
            return false;
        }
    }
    return true; 
    }
    
    //view cita, bez menjanje postojecih promenjivih
    function getAllUsers() public view returns (User[] memory) {
        User[] memory allUsers = new User[](user_count);

        for (uint i = 0; i < user_count; i++) {
            allUsers[i] = users[id_addresses_link[i]];
        }
        return allUsers;
    }

    //brisanje friend request
    function removeFriendRequest(address friend) public {
        User storage user = users[msg.sender];
        removeValue(user.friend_requests_list, friend);
    }

    //provera da l user postoji
    function isUserExist(address userAddress) public view returns (bool) {
        User storage user = users[userAddress];
        return (user.my_address == userAddress);
    }

    //registracija novog usera
    function registerNewUser(string memory _name) public{
        if (isUserExist(msg.sender)==false) {
            uint id = user_count;
            user_count++;

            address[] memory emptyFriendsList;
            address[] memory emptyFriendRequestsList;

            users[msg.sender] = User(id,msg.sender,_name, emptyFriendsList, emptyFriendRequestsList);
            id_addresses_link[id] = msg.sender;
            emit userRegistered(msg.sender);
        }
    }

    //slanje requesta
    function sendRequest(address _otherUserAddr) public {
        users[_otherUserAddr].friend_requests_list.push(msg.sender);
        emit requestSent(msg.sender);
    }

    //prihvatanje requesta
    function acceptRequest(address _otherUserAddr) public {
        require(checkValueNotInArray(users[msg.sender].friends_list, _otherUserAddr), "Vec ste prijatelji");
        removeFriendRequest(_otherUserAddr);
        users[msg.sender].friends_list.push(_otherUserAddr);
        users[_otherUserAddr].friends_list.push(msg.sender);
        emit requestAccepted(_otherUserAddr);
    }
}