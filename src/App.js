import { useState, useEffect } from "react";
import Web3 from "web3";
import FriendshipPlatform from "../src/contract/FriendshipPlatfrom.json";
import "./App.css";
import logo from "./logo.svg";
import usericon from "./usericon.svg";
import friends from "./friends.svg";
import requests from "./requests.svg";
import users from "./users.svg";
import friend from "./friend.svg";

function App() {
  const [accounts, setAccounts] = useState([]);
  const [result, setResult] = useState(null);
  const [friendshipPlatform, setFriendshipPlatform] = useState(null);
  const [otherUsersData, setOtherUsersData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [pendingRequestsData, setPendingRequestsData] = useState();
  const [friendsList, setFriendsList] = useState();
  const [userName, setUserName] = useState(" ");
  const web3 = new Web3(Web3.givenProvider);

  useEffect(() => {
    LoadBlockchainData();
  }, []);

  useEffect(() => {
    getAllUsers();
  }, [friendshipPlatform]);

  useEffect(() => {
    getMyUser();
  }, [accounts]);

  async function LoadBlockchainData() {
    if (web3) {
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
      console.log(accounts);

      const contract = new web3.eth.Contract(
        FriendshipPlatform,
        "0xB38de916A5e11A1CD161bd10A035955FD8a94Aa0"
      );
      setFriendshipPlatform(contract);
    }
  }

  const userExists = userData.address == accounts[0];
  function UserInfo() {
    return (
      <>
        {userExists ? (
          <div>
            <div className="miniNavbar">
              <div className="appName">
                <img src={logo} />
              </div>
            </div>
            <div className="userItems">
              <div className="userName">{userData.name}</div>
              <img src={usericon} />
            </div>
          </div>
        ) : (
          <>
            <div className="miniNavbar">
              <div className="appName">
                <img src={logo} />
              </div>
            </div>
            <div className="userItemRegister">
              <input
                type="text"
                onChange={(e) => setUserName(e.target.value)}
                placeholder="username..."
                className="input"
              />
              <button
                className="registerButton"
                onClick={() => Registration(userName)}
              >
                Register
              </button>
            </div>
          </>
        )}
      </>
    );
  }

  function PendingFriendRequest({ request }) {
    return (
      <div className="userItem">
        <div className="userItemLeft">
          <img src={friend} alt="Sender Profile" />
          <h3 className="friend">{request.senderName}</h3>
        </div>

        <div className="userItemRight">
          <button
            className="acceptButton"
            onClick={() => acceptRequest(request.address)}
          >
            Prihvati
          </button>
        </div>
        <br></br>
      </div>
    );
  }

  function FriendRequests() {
    return (
      <div className="other">
        <h2 className="group">Zahtevi za prijateljstvo</h2>
        {pendingRequestsData.map((request) => (
          <PendingFriendRequest key={request.id} request={request} />
        ))}
      </div>
    );
  }

  function UserItem({ user }) {
    return (
      <div className="userItem">
        <div className="userItemLeft">
          <img src={friend} alt="User Profile" />
          <h3 className="friend">{user.name}</h3>
        </div>
        <div className="userItemRight">
          <button
            className="acceptButton"
            onClick={() => sendFriendRequest(user.address)}
          >
            Dodaj
          </button>
        </div>
      </div>
    );
  }

  function Friend({ user }) {
    return (
      <div className="userItem">
        <div className="userItemLeft">
          <img src={friend} alt="User Profile" />
          <h3 className="friend">{user.name}</h3>
        </div>
        <div className="userItemRight"></div>
      </div>
    );
  }

  function Tabs() {
    return (
      <div className="tabs">
        <button
          className={`button${
            selectedOption === "otherUsers" ? "" : " inactive"
          }`}
          onClick={() => setSelectedOption("otherUsers")}
        >
          Korisnici
          <img src={users} className="iconImg" alt="Users Icon" />
        </button>
        <button
          className={`button${
            selectedOption === "yourFriends" ? "" : " inactive"
          }`}
          onClick={() => setSelectedOption("yourFriends")}
        >
          Prijatelji
          <img src={friends} className="iconImg" alt="Friends Icon" />
        </button>
        <button
          className={`button${
            selectedOption === "friendRequests" ? "" : " inactive"
          }`}
          onClick={() => setSelectedOption("friendRequests")}
        >
          Zahtevi za prijateljstvo
          <img src={requests} className="iconImg" alt="Requests Icon" />
        </button>
      </div>
    );
  }

  async function Registration(_name) {
    if (friendshipPlatform) {
      try {
        const result = await friendshipPlatform.methods
          .registerNewUser(_name)
          .send({ from: accounts[0] });
        setResult(result);
        const user = {
          id: result.id,
          name: result.name,
          address: accounts[0],
        };
        setUserData(user);

        console.log("register");
        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function getAllUsers() {
    if (friendshipPlatform) {
      try {
        const result = await friendshipPlatform.methods
          .getAllUsers()
          .call({ from: accounts[0] });
        setResult(result);
        console.log(result);
        const users = result
          .filter((user) => user.my_address !== accounts[0])
          .map((user) => ({
            id: user.id,
            name: user.name,
            address: user.my_address,
          }));

        const my_user = result.find((user) => user.my_address == accounts[0]);

        setOtherUsersData(users);
        setUserData({
          id: my_user.id,
          name: my_user.name,
          address: my_user.my_address,
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function getMyUser() {
    if (friendshipPlatform) {
      try {
        const result = await friendshipPlatform.methods
          .getAllUsers()
          .call({ from: accounts[0] });
        setResult(result);
        const my_user = result.find((user) => user.my_address == accounts[0]);
        console.log(my_user);

        const pendingRequestsData = [];
        const friendsListdata = [];

        if (my_user && my_user.friend_requests_list) {
          my_user.friend_requests_list.forEach(async (friendRequest) => {
            const result = await friendshipPlatform.methods
              .users(friendRequest)
              .call({ from: accounts[0] });

            const pendingRequest = {
              id: result.id,
              senderName: result.name,
              address: result.my_address,
            };

            pendingRequestsData.push(pendingRequest);
          });
        }
        if (my_user && my_user.friends_list) {
          my_user.friends_list.forEach(async (friend) => {
            const result = await friendshipPlatform.methods
              .users(friend)
              .call({ from: accounts[0] });

            const friend_inst = {
              id: result.id,
              name: result.name,
              address: result.my_address,
            };
            friendsListdata.push(friend_inst);
          });
        }

        setPendingRequestsData(pendingRequestsData);
        setFriendsList(friendsListdata);
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function sendFriendRequest(address) {
    if (friendshipPlatform) {
      try {
        const result = await friendshipPlatform.methods
          .sendRequest(address)
          .send({ from: accounts[0] });
        setResult(result);
        console.log(result);
        getMyUser();
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function acceptRequest(address) {
    if (friendshipPlatform) {
      try {
        const result = await friendshipPlatform.methods
          .acceptRequest(address)
          .send({ from: accounts[0] });
        setResult(result);
        console.log(result);
        getMyUser();
      } catch (error) {
        console.error(error);
      }
    }
  }

  function OtherUsers() {
    const excludedAddresses = [
      ...friendsList.map((friend) => friend.address),
      ...pendingRequestsData.map((request) => request.address),
    ];

    const filteredUsersData = otherUsersData.filter(
      (user) => !excludedAddresses.includes(user.address)
    );
    return (
      <div className="other">
        <h2 className="group">Korisnici</h2>
        {filteredUsersData.length > 0 ? (
          filteredUsersData.map((user) => (
            <UserItem key={user.id} user={user} />
          ))
        ) : (
          <p style={{ color: "#1E88E5" }}>Nema drugih korisnika.</p>
        )}
      </div>
    );
  }

  function YourFriends() {
    return (
      <div className="other">
        <h2 className="group">Prijatelji</h2>
        {friendsList.length > 0 ? (
          friendsList.map((user) => <Friend key={user.id} user={user} />)
        ) : (
          <p style={{ color: "#1E88E5" }}>Nemate prijatelje.</p>
        )}
      </div>
    );
  }

  let selectedSection;
  switch (selectedOption) {
    case "otherUsers":
      selectedSection = <OtherUsers />;
      break;
    case "friendRequests":
      selectedSection = <FriendRequests />;
      break;
    case "yourFriends":
      selectedSection = <YourFriends />;
      break;
  }

  return (
    <div className="app">
      <div className="navbar">
        <div className="userInfo">{UserInfo()}</div>
      </div>
      {userExists ? (
        <div className="wrap-container">
          <div className="container">
            <Tabs />
            <div className="friends">{selectedSection}</div>
          </div>
        </div>
      ) : (
        <div className="wrap-container2">Registruj se...</div>
      )}
    </div>
  );
}

export default App;
