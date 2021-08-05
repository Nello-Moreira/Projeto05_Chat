const axiosBase = axios.create({
    baseURL: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol',
    timeout: 2000
});

let loginName = "";
const privateMessage = "private_message";
const statusMessage = "status";
const STATUS_CODE = { nameUnavailable: 400 };

function login() {
    loginName = document.querySelector('#username').value;

    if (loginName !== "") {
        axiosBase.post("/participants",
            {
                name: loginName
            })
            .then(timedFunctions)
            .catch(loginError);
    }
}

function loginError(error) {
    const errorStatus = error.response.status;

    if (errorStatus === STATUS_CODE.nameUnavailable) {
        document.querySelector("#login-error").innerHTML = "Este nome de usuário já está em uso, por favor, tente outro."
    }
}

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

function selectMenuOption(element) {
    let elementParentNode = element.parentNode;

    if (elementParentNode.tagName === "UL") {
        elementParentNode = elementParentNode.parentNode;
    }

    const section = elementParentNode;
    const activeList = section.querySelectorAll("ion-icon.active");

    if (activeList.length > 0) {
        activeList[0].classList.remove("active");
    }
    element.querySelectorAll('ion-icon')[1].classList.add("active");

    // If the option "Todos" is selected, the option "Público" must be active
    if (getReceiver() === "Todos") {
        const privacySection = document.querySelector("#privacy-settings");
        const public = privacySection.querySelector("#public");
        const private = privacySection.querySelector("#private");

        public.querySelectorAll("ion-icon")[1].classList.add("active");
        private.querySelectorAll("ion-icon")[1].classList.remove("active");
    }
}

function getPrivacy() {
    const privacySection = document.querySelector("#privacy-settings");
    const privacySelection = privacySection.querySelector("ion-icon.active").parentNode;

    return privacySelection.children[0].children[1].innerHTML;
}

function getReceiver() {
    const receiverSection = document.querySelector("#contacts")
    let receiverName = "";
    try {
        const receiver = receiverSection.querySelector("ion-icon.active").parentNode;
        receiverName = receiver.children[0].children[1].innerHTML;
    } catch (error) {
        // if the receiver user left the chat change receiver to all
        selectMenuOption(document.querySelector("#all"));
        const receiver = receiverSection.querySelector("ion-icon.active").parentNode;
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

function updateMsgScreen(msgList, msgScreen, behavior) {
    for (index in msgList) {
        const currentMessage = msgList[index];
        let toSpanText = "";

        if (currentMessage.type === privateMessage) {
            if ((currentMessage.to !== loginName) && (currentMessage.from !== loginName)) {
                continue
            }
            toSpanText = "reservadamente ";
        }
        toSpanText += "para";

        const msgDiv = document.createElement("div");
        const timeSpan = document.createElement("span");
        const msgInfosDiv = document.createElement("span");
        const senderSpan = document.createElement("span");
        const toSpan = document.createElement("span");
        const receiverSpan = document.createElement("span");
        const colonSpan = document.createElement("span");
        const msgTextSpan = document.createElement("span");

        timeSpan.classList.add("time");
        msgInfosDiv.classList.add("msg-infos");
        senderSpan.classList.add("msg-sender");
        toSpan.classList.add("msg-to")
        receiverSpan.classList.add("msg-receiver");
        msgTextSpan.classList.add("msg-text");
        msgDiv.classList.add("message-container");
        if (currentMessage.type == statusMessage) {
            msgDiv.classList.add("status-msg-color");
        } else if (currentMessage.type == privateMessage) {
            msgDiv.classList.add("private-msg-color");
        }

        timeSpan.innerHTML = `(${currentMessage.time})`;
        senderSpan.innerHTML = `${currentMessage.from}`;
        toSpan.innerHTML = toSpanText;
        receiverSpan.innerHTML = `${currentMessage.to}`;
        colonSpan.innerHTML = ":";
        msgTextSpan.innerHTML = `${currentMessage.text}`;

        msgInfosDiv.appendChild(senderSpan);
        msgInfosDiv.appendChild(toSpan);
        msgInfosDiv.appendChild(receiverSpan);
        msgInfosDiv.appendChild(colonSpan);

        msgDiv.appendChild(timeSpan);
        msgDiv.appendChild(msgInfosDiv);
        msgDiv.appendChild(msgTextSpan);

        msgScreen.appendChild(msgDiv);
        msgDiv.scrollIntoView({ behavior: behavior, block: "start", inline: "nearest" });
    }
}

function getLastMsgIndex(displayedMsgs, serverMsgs) {
    function getTypeOfMsg(msgContainer) {
        if (msgContainer.classList.contains("status-msg-color")) {
            return statusMessage;
        } else if (msgContainer.classList.contains("private-msg-color")) {
            return privateMessage;
        } else {
            return "message";
        }
    }

    function equalMsgs(firstMsg, secondMsg) {
        for (key in firstMsg) {
            if (firstMsg[key] !== secondMsg[key]) {
                return false;
            }
        }
        return true;
    }

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

function getMessages() {
    function updateMsgs(response) {
        const serverMsgs = response.data
        const msgScreen = document.querySelector("main");
        const displayedMsgs = document.querySelectorAll(".message-container")

        if (displayedMsgs.length === 0) {
            updateMsgScreen(serverMsgs, msgScreen, "auto");
        } else {
            const lastMsgIndex = getLastMsgIndex(displayedMsgs, serverMsgs);

            if (lastMsgIndex !== (serverMsgs.length - 1)) {

                // the screen should updated from the message following the last
                updateMsgScreen(serverMsgs.slice(lastMsgIndex + 1), msgScreen, "smooth");
            }
        }
    }
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

function getServerUsernames(serverObject) {
    const names = [];

    for (user in serverObject) {
        names.push(serverObject[user].name);
    }
    return names
}

function mergeChatUsersWithServerUsers(userNames, serverParticipants, userMenuList) {
    const displayedUsers = userMenuList.children;
    let usersToAdd = [];
    let participantsIndex = 0;

    for (let i = 0; i < userNames.length; i++) {
        if (serverParticipants.length === 0) {
            displayedUsers[i].remove();
            userNames.splice(i, 1);
            i--;

        } else {
            for (let j = participantsIndex; j < serverParticipants.length; j++) {

                if (userNames[i] === serverParticipants[j].name) {
                    serverParticipants.splice(j, 1);
                    // participants names don't repeat themselves and are sorted alphabetically
                    // so the next loop can start from this index
                    participantsIndex = j;
                    break;
                } else {
                    if (j === serverParticipants.length - 1) {
                        displayedUsers[i].remove();
                        userNames.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    }
    if (serverParticipants.length !== 0) {
        usersToAdd = getServerUsernames(serverParticipants);
        addUsers(usersToAdd, userMenuList);
    }
}

function addUsers(usersToAdd, userMenuList) {
    const usersLI = [];

    //creating elements
    for (index in usersToAdd) {
        const user = document.createElement("li");
        const userDiv = document.createElement("div");
        const userName = document.createElement("p");
        const personIcon = document.createElement("ion-icon");
        const checkIcon = document.createElement("ion-icon");

        user.classList.add("menu-option");
        user.setAttribute("onclick", "selectMenuOption(this)");
        userName.innerHTML = usersToAdd[index];
        personIcon.name = "person-circle";
        checkIcon.name = "checkmark";
        if (usersToAdd[index] === loginName) {
            user.classList.add("hidden");
        }

        userDiv.appendChild(personIcon);
        userDiv.appendChild(userName);
        user.appendChild(userDiv);
        user.appendChild(checkIcon);

        if (userMenuList.children.length === 0) {
            userMenuList.appendChild(user);
        } else {
            usersLI.push(user);
        }
    }

    if (usersLI.length !== 0) {
        // Adding elements sorted alphabetically
        for (newUser in usersLI) {
            let newUserName = usersLI[newUser].querySelector("p").innerHTML.toLowerCase();
            let oldUserIndex = 0;

            for (let i = oldUserIndex; i < userMenuList.children.length; i++) {
                let oldUserName = userMenuList.children[i].querySelector("p").innerHTML.toLowerCase();

                if (newUserName < oldUserName) {
                    userMenuList.insertBefore(usersLI[newUser], userMenuList.children[i]);
                    oldUserIndex = i;
                    break;
                } else {
                    if (i === userMenuList.children.length - 1) {
                        userMenuList.appendChild(usersLI[newUser]);
                        break;
                    }
                }
            }
        }
    }
}

function getParticipants() {
    function updateParticipants(response) {
        const serverParticipants = response.data
        const userMenuList = document.querySelector("#active-users");
        const userNames = getUserNames(userMenuList);

        mergeChatUsersWithServerUsers(userNames, serverParticipants, userMenuList);
    }
    axiosBase.get("/participants")
        .then(updateParticipants);
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

function enterToSend(event) {
    if (event.key === "Enter"){
        sendMessage();
    }
}

function sendMessage() {
    const messageInput = document.querySelector('#new-message');

    if (messageInput.value !== "") {
        const typePublic = document.querySelector("#public").querySelector("p").innerHTML;
        const typePrivate = document.querySelector("#private").querySelector("p").innerHTML;
        let msgType = getPrivacy();

        if (msgType === typePublic) {
            msgType = "message";
        } else if (msgType === typePrivate) {
            msgType = "private_message";
        }
        axiosBase.post("/messages", {
            from: loginName,
            to: getReceiver(),
            text: messageInput.value,
            type: msgType,
        })
            .then(getMessages)
            .catch(reloadPage)

        messageInput.value = "";
    }
}

function reloadPage() {
    window.location.reload();
}

function timedFunctions() {
    document.querySelector(".login-page").remove();

    // Functions that interact with the server
    getMessages();
    getParticipants();
    setInterval(getMessages, 3000);
    setInterval(getParticipants, 10000);
    setInterval(refreshStatus, 5000, loginName);

    // Exclusively front-end functions
    setInterval(checkMsgInput, 500);
    setInterval(getReceiver, 500);
}