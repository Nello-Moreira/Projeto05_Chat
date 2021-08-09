const axiosBase = axios.create({
    baseURL: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol',
    timeout: 2000
});

let loginName = "";
const msgType = {
    privateMsg: "private_message",
    statusMsg: "status",
    normalMsg: "message"
};
const STATUS_CODE = {
    nameUnavailable: 400
};

function refreshStatus(loginName) {
    axiosBase.post("/status",
        {
            name: loginName
        });
}

function openMenu() {
    const menuContainer = document.querySelector(".menu-container");
    const menu = menuContainer.querySelector(".menu");
    menuContainer.classList.add("active");
    menu.classList.add("active");
}

function closeMenu(menuContainerBlankSpace) {
    const menuContainer = menuContainerBlankSpace.parentNode;
    const menu = menuContainer.querySelector(".menu");
    menuContainer.classList.remove("active");
    menu.classList.remove("active");
}

function getSection(element) {
    if (element.parentNode.tagName === "UL") {
        return element.parentNode.parentNode;
    }
    return element.parentNode;
}

function changeActiveIcon(elementToActivate) {
    const section = getSection(elementToActivate);
    const activeList = section.querySelectorAll("ion-icon.active");

    if (activeList.length > 0) {
        activeList[0].classList.remove("active");
    }
    elementToActivate.querySelectorAll('ion-icon')[1].classList.add("active");
}

function checkIfItsEverybody() {
    // If the option "Todos" is selected, the option "Público" must be active
    if (getReceiver() === "Todos") {
        const privacySection = document.querySelector("#privacy-settings");
        const public = privacySection.querySelector("#public");
        const private = privacySection.querySelector("#private");
        public.querySelectorAll("ion-icon")[1].classList.add("active");
        private.querySelectorAll("ion-icon")[1].classList.remove("active");
    }
}

function selectMenuOption(element) {
    changeActiveIcon(element);
    checkIfItsEverybody();
}

function getPrivacy() {
    const privacySection = document.querySelector("#privacy-settings");
    const privacySelection = privacySection.querySelector("ion-icon.active").parentNode;

    return privacySelection.children[0].children[1].innerHTML;
}

function getReceiver() {
    const receiverSection = document.querySelector("#contacts");
    let receiver;
    let receiverName;

    try {
        receiver = receiverSection.querySelector("ion-icon.active").parentNode;
        receiverName = receiver.children[0].children[1].innerHTML;
    } catch (error) {
        selectMenuOption(document.querySelector("#all"));
        receiver = receiverSection.querySelector("ion-icon.active").parentNode;
        receiverName = receiver.children[0].children[1].innerHTML;
    } finally {
        updateMsgPrivacyInfo(receiverName);
        return receiverName;
    }
}

function updateMsgPrivacyInfo(receiver) {
    let sendToInfo = `Enviando para ${receiver}`;

    if (getPrivacy() === "Reservadamente") {
        sendToInfo += " (reservadamente)"
    }
    document.querySelector("#msg-privacy-info").innerHTML = sendToInfo;
}

function msgNotAllowed(message) {
    if (message.type === msgType.privateMsg) {
        if ((message.to !== loginName) && (message.from !== loginName)) {
            return true;
        }
    }
    return false;
}

function createMsgContainer(message) {
    const msgDiv = document.createElement("div");
    const timeSpan = document.createElement("span");
    const msgInfosDiv = document.createElement("span");
    const senderSpan = document.createElement("span");
    
    const msgTextSpan = document.createElement("span");
    let toSpanText = "";

    if (message.type === msgType.privateMsg) {
        msgDiv.classList.add("private-msg-color");
        toSpanText = "reservadamente ";
    } else if (message.type == msgType.statusMsg) {
        msgDiv.classList.add("status-msg-color");
    }
    toSpanText += "para";

    timeSpan.classList.add("time");
    msgInfosDiv.classList.add("msg-infos");
    senderSpan.classList.add("msg-sender");
    msgTextSpan.classList.add("msg-text");
    msgDiv.classList.add("message-container");
    
    if (message.type !== msgType.statusMsg){
        const toSpan = document.createElement("span");
        const receiverSpan = document.createElement("span");
        const colonSpan = document.createElement("span");

        toSpan.classList.add("msg-to")
        receiverSpan.classList.add("msg-receiver");

        toSpan.innerHTML = toSpanText;
        receiverSpan.innerHTML = `${message.to}`;
        colonSpan.innerHTML = ":";
        
        msgInfosDiv.appendChild(toSpan);
        msgInfosDiv.appendChild(receiverSpan);
        msgInfosDiv.appendChild(colonSpan);
    }

    timeSpan.innerHTML = `(${message.time})`;
    senderSpan.innerHTML = `${message.from}`;
    msgTextSpan.innerHTML = `${message.text}`;

    msgInfosDiv.appendChild(senderSpan);
    msgDiv.appendChild(timeSpan);
    msgDiv.appendChild(msgInfosDiv);
    msgDiv.appendChild(msgTextSpan);

    return msgDiv;
}

function updateMsgScreen(msgList, msgScreen, behavior) {
    for (index in msgList) {
        if (!msgNotAllowed(msgList[index])) {
            const msgDiv = createMsgContainer(msgList[index]);
            msgScreen.appendChild(msgDiv);
            msgDiv.scrollIntoView({ behavior: behavior, block: "start", inline: "nearest" });
        }
    }
}

function getTypeOfMsg(msgContainer) {
    if (msgContainer.classList.contains("status-msg-color")) {
        return msgType.statusMsg;
    } else if (msgContainer.classList.contains("private-msg-color")) {
        return msgType.privateMsg;
    }
    return msgType.normalMsg;
}

function equalMsgs(firstMsg, secondMsg) {
    for (key in firstMsg) {
        if (firstMsg[key] !== secondMsg[key]) {
            return false;
        }
    }
    return true;
}

function getLastMsgIndex(displayedMsgs, serverMsgs) {
    const lastMsg = displayedMsgs[displayedMsgs.length - 1]
    const lastMsgObject = {
        from: lastMsg.querySelector("span.msg-sender").innerHTML,
        to: lastMsg.querySelector("span.msg-receiver").innerHTML,
        text: lastMsg.querySelector("span.msg-text").innerHTML,
        type: getTypeOfMsg(lastMsg),
        time: lastMsg.querySelector("span.time").innerHTML.slice(1, 9)
    }

    for (let i = serverMsgs.length - 1; i >= 0; i--) {
        if (equalMsgs(lastMsgObject, serverMsgs[i])) {
            return i;
        }
    }
    return -1;
}

function updateMsgs(response) {
    const serverMsgs = response.data
    const msgScreen = document.querySelector("main");
    const displayedMsgs = document.querySelectorAll(".message-container")

    if (displayedMsgs.length === 0) {
        updateMsgScreen(serverMsgs, msgScreen, "auto");
    } else {
        const lastMsgIndex = getLastMsgIndex(displayedMsgs, serverMsgs);

        if (lastMsgIndex !== (serverMsgs.length - 1)) {
            updateMsgScreen(serverMsgs.slice(lastMsgIndex + 1), msgScreen, "smooth");
        }
    }
}

function getMessages() {
    axiosBase.get("/messages")
        .then(updateMsgs);
}

function getUserNames(userMenuList) {
    const displayedUsers = userMenuList.children;
    const userNames = [];

    for (let i = 0; i < displayedUsers.length; i++) {
        userNames.push(displayedUsers[i].querySelector("p").innerHTML);
    }
    return userNames;
}

function getServerUsernames(serverParticipants) {
    const names = [];

    for (user in serverParticipants) {
        names.push(serverParticipants[user].name);
    }
    return names
}

function removeParticipants(userMenuList, startIndex, stopIndex = userMenuList.children.length) {
    for (let i = stopIndex - 1; i >= startIndex; i--) {
        (userMenuList.children)[i].remove();
    }
}

function mergeChatUsersWithServerUsers(userNames, serverParticipants, userMenuList) {
    let participantsIndex = 0;

    for (let i = 0; i < userNames.length; i++) {
        if (serverParticipants.length === 0) {
            removeParticipants(userMenuList, i);
            break;
        }
        for (let j = participantsIndex; j < serverParticipants.length; j++) {
            if (userNames[i] === serverParticipants[j].name) {
                serverParticipants.splice(j, 1);
                // participants names don't repeat themselves and are sorted alphabetically
                // so the next loop can start from this index
                participantsIndex = j;
                break;
            } else if (j === serverParticipants.length - 1) {
                (userMenuList.children)[i].remove();
                userNames.splice(i, 1);
                i--;
            }
        }

    }

    if (serverParticipants.length !== 0) {
        return getServerUsernames(serverParticipants);
    }
    return false;
}

function createUserContainer(userToAdd) {
    const user = document.createElement("li");
    const userDiv = document.createElement("div");
    const userName = document.createElement("p");
    const personIcon = document.createElement("ion-icon");
    const checkIcon = document.createElement("ion-icon");

    user.classList.add("menu-option");
    user.setAttribute("onclick", "selectMenuOption(this)");
    userName.innerHTML = userToAdd;
    personIcon.name = "person-circle";
    checkIcon.name = "checkmark";

    if (userToAdd === loginName) {
        user.classList.add("hidden");
    }

    userDiv.appendChild(personIcon);
    userDiv.appendChild(userName);
    user.appendChild(userDiv);
    user.appendChild(checkIcon);

    return user;
}

function addAlphabetically(usersList, userMenuList) {
    let newUserName;
    let oldUserName;
    let oldUserIndex = 0;

    for (newUser in usersList) {
        newUserName = usersList[newUser].querySelector("p").innerHTML.toLowerCase();

        for (let i = oldUserIndex; i < userMenuList.children.length; i++) {
            oldUserName = userMenuList.children[i].querySelector("p").innerHTML.toLowerCase();

            if (newUserName < oldUserName) {
                userMenuList.insertBefore(usersList[newUser], userMenuList.children[i]);
                oldUserIndex = i;
                break;
            } else if (i === userMenuList.children.length - 1) {
                userMenuList.appendChild(usersList[newUser]);
            }
        }
    }
}

function addUsers(usersToAdd, userMenuList) {
    const usersList = [];
    let user;

    for (index in usersToAdd) {
        user = createUserContainer(usersToAdd[index]);

        if (userMenuList.children.length === 0) {
            userMenuList.appendChild(user);
        } else {
            usersList.push(user);
        }
    }

    if (usersList.length !== 0) {
        addAlphabetically(usersList, userMenuList);
    }
}

function updateParticipants(response) {
    const serverParticipants = response.data
    const userMenuList = document.querySelector("#active-users");
    const userNames = getUserNames(userMenuList);
    const usersToAdd = mergeChatUsersWithServerUsers(userNames, serverParticipants, userMenuList);

    if (usersToAdd) {
        addUsers(usersToAdd, userMenuList);
    }
}

function getParticipants() {
    axiosBase.get("/participants")
        .then(updateParticipants);
}

function enterToSend(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function checkMsgInput() {
    const msgContainer = document.querySelector(".message-input-container");
    const msg = msgContainer.querySelector("input").value;
    const sendIcon = msgContainer.querySelector("ion-icon");

    if (msg !== "") {
        sendIcon.classList.add("active");
        sendIcon.setAttribute("onclick", "sendMessage()");
        document.addEventListener("keypress", enterToSend);
    } else {
        sendIcon.classList.remove("active");
        sendIcon.removeAttribute("onclick");
        document.removeEventListener("keypress", enterToSend);
    }
}

function reloadPage() {
    window.location.reload();
}

function sendMessage() {
    const messageInput = document.querySelector('#new-message');
    const typePublic = document.querySelector("#public").querySelector("p").innerHTML;
    const typePrivate = document.querySelector("#private").querySelector("p").innerHTML;
    let privacyType = getPrivacy();

    if (privacyType === typePublic) {
        privacyType = msgType.normalMsg;
    } else if (privacyType === typePrivate) {
        privacyType = msgType.privateMsg;
    }
    axiosBase.post("/messages", {
        from: loginName,
        to: getReceiver(),
        text: messageInput.value,
        type: privacyType
    })
        .then(getMessages)
        .catch(reloadPage)

    messageInput.value = "";
}

function loginError(error) {
    const errorStatus = error.response.status;

    document.querySelector(".login-input").classList.remove("hidden");
    document.querySelector(".login-animation-container").classList.add("hidden");

    if (errorStatus === STATUS_CODE.nameUnavailable) {
        document.querySelector("#login-error").innerHTML = "Este nome de usuário já está em uso, por favor, tente outro."
    }
}

function displayWaitingAnimation(){
    document.querySelector(".login-input").classList.add("hidden");
    document.querySelector(".login-animation-container").classList.remove("hidden");
}

function timedFunctions() {
    document.querySelector(".login-page").remove();

    setInterval(checkMsgInput, 500);
    setInterval(getReceiver, 500);

    getMessages();
    getParticipants();
    setInterval(getMessages, 3000);
    setInterval(getParticipants, 10000);
    setInterval(refreshStatus, 5000, loginName);

}

function login() {
    loginName = document.querySelector('#username').value;

    if (loginName !== "") {
        displayWaitingAnimation()
        axiosBase.post("/participants",
            {
                name: loginName
            })
            .then(timedFunctions)
            .catch(loginError);
    }
}