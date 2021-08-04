const axiosBase = axios.create({
    baseURL: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol',
    timeout: 2000
});

let allMessages = "";
let participants = [];

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

    if (elementParentNode.tagName === "UL"){
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

    updateMsgPrivacyInfo();
}

function getPrivacy(){
    const privacySection = document.querySelector("#privacy-settings");
    const privacySelection = privacySection.querySelector("ion-icon.active").parentNode;
    
    return privacySelection.children[0].children[1].innerHTML;
}

function getReceiver(){
    const receiverSection = document.querySelector("#contacts")
    const receiver = receiverSection.querySelector("ion-icon.active").parentNode;
    
    return receiver.children[0].children[1].innerHTML;
}

function updateMsgPrivacyInfo() {
    let sendToInfo = `Enviando para ${getReceiver()}`;
    
    if (getPrivacy() === "Reservadamente"){
        sendToInfo += " (reservadamente)"
    }

    document.querySelector("#msg-privacy-info").innerHTML = sendToInfo;
}

function getMessages(){
    function returnMessages(response){
        allMessages = response.data
        console.log(allMessages);
    }

    const msgPromise = axiosBase.get("/messages");
    msgPromise.then(returnMessages);
}

function getParticipants(){
    function returnParticipants(response){
        participants = response.data
        console.log(participants);
    }

    const usersPromise = axiosBase.get("/participants");
    usersPromise.then(returnParticipants);
}

function sendMessage() {
    const main = document.querySelector('main');
    const messageInput = document.querySelector('#new-message');

    if (messageInput.value !== "") {
        console.log(messageInput.value);
        messageInput.value = "";
    }
}
