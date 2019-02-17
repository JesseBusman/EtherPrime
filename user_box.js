"use strict";

async function updateUserBoxesUsernames()
{
    const userBoxes = document.getElementsByClassName("userBox");
    const promises = [];
    for (let i=0; i<userBoxes.length; i++)
    {
        promises.push(updateUserBoxUsername(userBoxes[i]));
    }
    await Promise.all(promises);
}

async function updateUserBoxUsername(userBox)
{
    const bytes32 = await callContract("EtherPrimeChat::addressToUsername", userBox.getAttribute("address"));
    const str = bytes32_to_string(bytes32);
    userBox.childNodes[2].innerText = str;
}

function createUserBox(address)
{
	if (!web3.utils.isAddress(address)) throw "createUserBox received non-address="+address;
    const userBox = document.createElement("div");
    {
        userBox.classList.add("userBox");
        userBox.setAttribute("address", address);
        userBox.appendChild(blockies({seed: address.toLowerCase(), size: 8, scale: 5}));
        
        const addressDiv = document.createElement("div");
        {
            addressDiv.classList.add("address");
            addressDiv.innerText = address;
        }
        userBox.appendChild(addressDiv);
        
        const usernameDiv = document.createElement("div");
        {
            usernameDiv.classList.add("username");
        }
        userBox.appendChild(usernameDiv);
        userBox.addEventListener("click", function(){searchFor(address);});
    }
    updateUserBoxUsername(userBox);
    return userBox;
}
