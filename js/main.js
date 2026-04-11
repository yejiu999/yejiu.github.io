// ==================== 全局用户状态 ====================
let currentUser = null;
const USER_KEY = "jadeUsers";
const CURRENT_USER_KEY = "currentJadeUser";

// ==================== 页面初始化 ====================
window.onload = function () {
    initUser();
    initSlide(); // 轮播初始化合并在这里
};

// ==================== 登录/注册功能 ====================
function initUser() {
    currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (currentUser) {
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("userInfo").style.display = "inline";
        document.getElementById("logoutBtn").style.display = "inline";
        document.getElementById("nickname").innerText = currentUser.nickname;
    } else {
        document.getElementById("loginBtn").style.display = "inline";
        document.getElementById("userInfo").style.display = "none";
        document.getElementById("logoutBtn").style.display = "none";
    }
}

function openLogin() {
    document.getElementById("loginModal").style.display = "block";
    document.getElementById("loginTip").innerText = "";
}

function closeLogin() {
    document.getElementById("loginModal").style.display = "none";
}

// 发送验证码（模拟：固定123456，但必须点获取才能用）
let codeTimer = null;
let canUseCode = false; // 标记：是否可以使用验证码

function sendCode() {
    let phone = document.getElementById("phone").value;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        document.getElementById("loginTip").innerText = "请输入正确手机号";
        return;
    }

    let btn = document.getElementById("sendCodeBtn");
    btn.disabled = true;
    let sec = 60;
    btn.innerText = sec + "秒后重发";

    // 允许使用验证码（必须点了才能用）
    canUseCode = true;

    codeTimer = setInterval(() => {
        sec--;
        btn.innerText = sec + "秒后重发";
        if (sec <= 0) {
            clearInterval(codeTimer);
            btn.disabled = false;
            btn.innerText = "获取验证码";
            canUseCode = false; // 超时后不能再用
        }
    }, 1000);
}

// 新增：打开登录弹窗时重置验证码状态
function openLogin1() {
    document.getElementById("loginModal").style.display = "block";
    document.getElementById("loginTip").innerText = "";
    // 重置验证码状态
    canUseCode = false;
    clearInterval(codeTimer);
    let btn = document.getElementById("sendCodeBtn");
    btn.disabled = false;
    btn.innerText = "获取验证码";
}

// 登录/注册
function doLogin1() {
    let phone = document.getElementById("phone").value;
    let code = document.getElementById("code").value;
    let nickname = document.getElementById("newNickname").value.trim();

    if (!phone || !code) {
        document.getElementById("loginTip").innerText = "请输入手机号和验证码";
        return;
    }

    // 核心逻辑：验证码必须是123456，且必须获取过
    if (code !== "123456" || !canUseCode) {
        document.getElementById("loginTip").innerText = "验证码错误或未获取";
        return;
    }

    // 一次性：登录后立即失效，必须重新获取
    canUseCode = false;

    let users = JSON.parse(localStorage.getItem(USER_KEY)) || [];
    let hasUser = users.find(u => u.phone === phone);

    if (hasUser) {
        currentUser = hasUser;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        closeLogin();
        initUser();
        showPage("user");
        return;
    }

    let nicknameBox = document.getElementById("nicknameBox");
    if (nicknameBox.style.display === "none") {
        nicknameBox.style.display = "block";
        document.getElementById("loginTip").innerText = "首次登录，请设置唯一昵称";
        return;
    }

    if (!nickname) {
        document.getElementById("loginTip").innerText = "请输入昵称";
        return;
    }
    if (users.find(u => u.nickname === nickname)) {
        document.getElementById("loginTip").innerText = "昵称已被占用，请更换";
        return;
    }

    let newUser = { phone, nickname, collect: [], order: [] };
    users.push(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(users));
    currentUser = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    closeLogin();
    initUser();
    showPage("user");
}

// 退出登录时重置验证码状态
function logout() {
    if (confirm("确定要退出登录吗？")) {
        localStorage.removeItem(CURRENT_USER_KEY);
        currentUser = null;

        // 重置验证码状态
        canUseCode = false;
        clearInterval(codeTimer);
        let btn = document.getElementById("sendCodeBtn");
        if (btn) {
            btn.disabled = false;
            btn.innerText = "获取验证码";
        }

        document.getElementById("loginBtn").style.display = "inline";
        document.getElementById("userInfo").style.display = "none";
        document.getElementById("logoutBtn").style.display = "none";
        showPage('index');
        alert("已成功退出登录！");
    }
}
//  检查登录（记录来源页面）
let redirectPage = "index"; // 记录要返回的页面
function checkLogin(toPage) {
    if (!currentUser) {
        alert("请先登录～");
        redirectPage = "detail"; // 标记：登录后返回详情页
        openLogin();
        return false;	
    }
    showPage(toPage);
}
// ==================== 搜索 + 历史功能 ====================
const jadeData = [
    {id:"hetian",name:"和田玉",img:"./img/4.jpeg",desc:"中国四大名玉之一，质地温润细腻，色泽柔和，素有君子比德于玉之说。"},
    {id:"feicui",name:"翡翠",img:"./img/5.jpeg",desc:"又称缅甸玉，色彩丰富，质地通透，以绿为贵，是玉石中的珍品。"},
    {id:"dushan",name:"独山玉",img:"./img/6.jpg",desc:"中国四大名玉之一，产于河南南阳独山，色彩斑斓，质地坚韧。"},
    {id:"xiu",name:"岫玉",img:"./img/7.jpg",desc:"中国四大名玉之一，产于辽宁岫岩，质地细腻，色泽丰富，产量较大。"},
];

const HISTORY_KEY = "searchHistory";
function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}
function saveHistory(keyword) {
    if (!keyword) return;
    let list = getHistory().filter(i => i !== keyword);
    list.unshift(keyword);
    if (list.length > 10) list = list.slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}
function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
}
function renderHistory() {
    let el = document.getElementById("searchHistory");
    let list = getHistory();
    if (list.length === 0) {
        el.innerHTML = `<div class="history-item">暂无搜索历史</div>`;
        return;
    }
    let html = "";
    list.forEach(i => html += `<div class="history-item">${i}</div>`);
    html += `<div class="history-clear" onclick="clearHistory()">清空历史</div>`;
    el.innerHTML = html;
}
function showHistory() { renderHistory(); document.getElementById("searchHistory").style.display = "block"; }
function hideHistory() { document.getElementById("searchHistory").style.display = "none"; }
function hideHistoryDelay() { setTimeout(hideHistory, 150); }
function selectHistory(e) {
    if (e.target.classList.contains("history-item")) {
        let v = e.target.innerText;
        document.getElementById("searchInput").value = v;
        search();
    }
}

function search() {
    let input = document.getElementById("searchInput");
    let keyword = input.value.trim();
    if (!keyword) { alert("请输入搜索内容"); return; }
    saveHistory(keyword);
    let result = jadeData.filter(i => i.name.includes(keyword));
    let list = document.getElementById("searchResultList");
    list.innerHTML = "";
    if (result.length === 0) {
        list.innerHTML = `<div style="padding:30px;text-align:center;width:100%">未找到相关玉石</div>`;
    } else {
        result.forEach(item => {
            let div = document.createElement("div");
            div.className = "category-item";
            div.onclick = () => showDetail(item.id);
            div.innerHTML = `<img src="${item.img}"><div class="info"><h3>${item.name}</h3><p>${item.desc}</p></div>`;
            list.appendChild(div);
        });
    }
    hideAllPages();
    document.getElementById("search-result").style.display = "block";
    input.value = "";
    hideHistory();
}

// 轮播图核心逻辑
let slideIndex = 0;
let slides = [];
let dots = [];
let interval;

function initSlide() {
    slides = document.querySelectorAll('.slide');
    dots = document.querySelectorAll('.dot');
    if(slides.length){
        showSlides(slideIndex);
        autoSlide();
        const banner = document.querySelector('.banner');
        banner.addEventListener('mouseenter', () => clearInterval(interval));
        banner.addEventListener('mouseleave', autoSlide);
    }
}

function showSlides(n) {
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;
    document.querySelector('.banner-slides').style.transform = `translateX(${-slideIndex * 100}%)`;
    dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === slideIndex) dot.classList.add('active');
    });
}

function prevSlide() {
    slideIndex--;
    showSlides(slideIndex);
}

function nextSlide() {
    slideIndex++;
    showSlides(slideIndex);
}

function currentSlide(n) {
    slideIndex = n;
    showSlides(slideIndex);
}

function autoSlide() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 4000);
}

// ==================== 页面切换 ====================
function showPage(page) {
    hideAllPages();
    document.getElementById("searchInput").value = "";
    if (page === "index" || page === "category") {
        document.getElementById("index-page").style.display = "block";
    } else if (page === "user") {
        document.getElementById("user-page").style.display = "block";
        renderCollect();
        renderOrder();
    }
}

function hideAllPages() {
    document.getElementById("index-page").style.display = "none";
    document.getElementById("detail-page").style.display = "none";
    document.getElementById("user-page").style.display = "none";
    document.getElementById("search-result").style.display = "none";
}

// ==================== 详情页 ====================
let currentJade = null;
// 显示玉石详情页
function showDetail(type) {
    document.getElementById('index-page').style.display = 'none';
    document.getElementById('detail-page').style.display = 'block';
    
    let title, img, desc;
    switch(type) {
        case 'hetian':
            title = '和田玉';
            img = './img/4.jpeg';
            desc = '和田玉，又称软玉、真玉，主要产于新疆和田地区，是中国四大名玉之一。其质地温润细腻，油脂光泽强，素有"君子比德于玉"的文化内涵。和田玉按颜色可分为白玉、青玉、碧玉、黄玉、墨玉等，其中羊脂白玉最为珍贵。和田玉的开采和使用历史可追溯到商周时期，是中华玉文化的核心代表。';
            break;
        case 'feicui':
            title = '翡翠';
            img = './img/5.jpeg';
            desc = '翡翠，也称缅甸玉，是玉的一种，主要成分为硬玉。其色彩丰富，以绿色为贵，素有"玉中之王"的美誉。翡翠的品质主要从种、水、色、工四个方面评价，玻璃种、冰种为上品。翡翠主要产于缅甸北部，清代开始大规模传入中国，成为高端玉石收藏的主流。';
            break;
        case 'dushan':
            title = '独山玉';
            img = './img/6.jpg';
            desc = '独山玉，因产于河南南阳独山而得名，又称"南阳玉"或"独玉"，是中国四大名玉之一。独山玉色彩斑斓，可分为白、绿、黄、紫、红、黑等色系，质地坚韧，硬度高，适合雕刻。独山玉的开采历史超过6000年，殷墟妇好墓中就出土了独山玉制品。';
            break;
        case 'xiu':
            title = '岫玉';
            img = './img/7.jpg';
            desc = '岫玉，产于辽宁岫岩满族自治县，又称岫岩玉，是中国四大名玉之一。其质地细腻温润，色泽丰富，主要有深绿、浅绿、黄、白等颜色。岫玉的储量大，价格亲民，是普及率最高的玉石品种之一，常用于制作摆件、饰品等。岫玉的使用历史可追溯到新石器时代的红山文化。';
            break;
    }
    
    document.getElementById('detail-title').innerText = title;
        // 直接给 img 标签设置 src
        document.getElementById('detail-img-tag').src = img;
        document.getElementById('detail-img-tag').alt = title;
        document.getElementById('detail-desc').innerText = desc;
    window.currentDetailTitle = title;
	currentJade = {
	        id: type,
	        name: title,
	        img: img,
	        desc: desc
	    };
}


// ==================== 收藏 & 订单（登录可用） ====================
function addCollect() {
    if (!currentUser) { 
            alert("请先登录"); 
            redirectPage = "detail"; // 登录后返回详情
            openLogin(); 
            return; 
    }
    // 确保商品数据存在
    if (!currentJade || !currentJade.id) { 
        alert("商品数据异常，请重新进入详情页！"); 
        return; 
    }
    
    let users = JSON.parse(localStorage.getItem(USER_KEY)) || [];
    let userIndex = users.findIndex(i => i.phone === currentUser.phone);
    if (userIndex === -1) return;

    // 避免重复收藏
    if (!users[userIndex].collect.includes(currentJade.id)) {
        users[userIndex].collect.push(currentJade.id);
        alert("收藏成功！");
    } else {
        alert("已收藏过该商品！");
    }
    
    localStorage.setItem(USER_KEY, JSON.stringify(users));
    currentUser = users[userIndex];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
}

function doLogin() {
    let phone = document.getElementById("phone").value;
    let code = document.getElementById("code").value;
    let nickname = document.getElementById("newNickname").value.trim();

    if (!phone || !code) {
        document.getElementById("loginTip").innerText = "请输入手机号和验证码";
        return;
    }

    if (code !== "123456" || !canUseCode) {
        document.getElementById("loginTip").innerText = "验证码错误或未获取";
        return;
    }

    canUseCode = false;

    let users = JSON.parse(localStorage.getItem(USER_KEY)) || [];
    let hasUser = users.find(u => u.phone === phone);

    if (hasUser) {
        currentUser = hasUser;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        closeLogin();
        initUser();
        
        // 登录成功回到原来页面（不跳个人中心）
        if(redirectPage === "detail"){
            redirectPage = "index";
            // 保持在详情页，不跳转
        }else{
            showPage("user");
        }
        return;
    }

    let nicknameBox = document.getElementById("nicknameBox");
    if (nicknameBox.style.display === "none") {
        nicknameBox.style.display = "block";
        document.getElementById("loginTip").innerText = "首次登录，请设置唯一昵称";
        return;
    }

    if (!nickname) {
        document.getElementById("loginTip").innerText = "请输入昵称";
        return;
    }
    if (users.find(u => u.nickname === nickname)) {
        document.getElementById("loginTip").innerText = "昵称已被占用，请更换";
        return;
    }

    let newUser = { phone, nickname, collect: [], order: [] };
    users.push(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(users));
    currentUser = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    closeLogin();
    initUser();
    
    // 注册成功也回到原来页面
    if(redirectPage === "detail"){
        redirectPage = "index";
    }else{
        showPage("user");
    }
}

function addOrder() {
    if (!currentUser) { alert("请先登录"); openLogin(); return; }
    if (!currentJade) { alert("商品数据异常"); return; }

    let users = JSON.parse(localStorage.getItem(USER_KEY)) || [];
    let userIndex = users.findIndex(i => i.phone === currentUser.phone);
    if (userIndex === -1) return;

    users[userIndex].order.push({
        jade: currentJade,
        time: new Date().toLocaleString()
    });

    localStorage.setItem(USER_KEY, JSON.stringify(users));
    currentUser = users[userIndex];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    alert("下单成功");
}

function renderCollect() {
    let el = document.getElementById("collect-list");
    let collectIds = currentUser?.collect || [];
    if (collectIds.length === 0) {
        el.innerHTML = `<div class="collect-item">暂无收藏</div>`;
        return;
    }
    let html = "";
    collectIds.forEach(id => {
        let jade = jadeData.find(item => item.id === id);
        if(jade) html += `<div class="collect-item">${jade.name}</div>`;
    });
    el.innerHTML = html;
}

function renderOrder() {
    let el = document.getElementById("order-list");
    let orders = currentUser?.order || [];
    if (orders.length === 0) {
        el.innerHTML = `<div class="order-item">暂无订单</div>`;
        return;
    }
    let html = "";
    orders.forEach(o => {
        html += `<div class="order-item">${o.jade.name} - ${o.time}</div>`;
    });
    el.innerHTML = html;
}
// ==================== AI小助手核心逻辑 ====================
// 控制弹窗显示/隐藏
function toggleAIDialog() {
    const dialog = document.getElementById("aiDialog");
    const mask = document.getElementById("aiMask");
    dialog.style.display = dialog.style.display === "block" ? "none" : "block";
    mask.style.display = mask.style.display === "block" ? "none" : "block";
    if (dialog.style.display === "block") {
        document.getElementById("aiInput").focus();
    }
}

// 发送消息给AI（已填好你的API Key，直接可用）
function sendAIMsg() {
    const input = document.getElementById("aiInput");
    const content = input.value.trim();
    const aiContent = document.getElementById("aiContent");
    if (!content) return;

    // 显示用户消息
    aiContent.innerHTML += `<div class="ai-msg ai-user">${content}</div>`;
    input.value = "";
    aiContent.scrollTop = aiContent.scrollHeight;

    // 显示加载中
    aiContent.innerHTML += `<div class="ai-msg ai-system" id="aiLoading">正在思考...</div>`;
    aiContent.scrollTop = aiContent.scrollHeight;

    // 已填入你的真实 API Key
    const API_KEY = "bce-v3/ALTAK-I5retdndBUjitupt4m4um/beb4a8335d484d3df677f8c43050bd1adc27c13e";

    // 正确接口 100% 可用
    fetch("https://qianfan.baidubce.com/v2/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + API_KEY
        },
        body: JSON.stringify({
            "model": "ERNIE-3.5-8K",
            "messages": [
                {
                    "role": "system",
                    "content": "你是专业玉石文化助手，回答和田玉、翡翠、独山玉、岫玉的种类、鉴定、保养、文化知识。"
                },
                {
                    "role": "user",
                    "content": content
                }
            ]
        })
    })
    .then(res => res.json())
    .then(aiRes => {
        document.getElementById("aiLoading").remove();
        const answer = aiRes.choices?.[0]?.message?.content || "我正在学习玉石知识，请换个问题~";
        aiContent.innerHTML += `<div class="ai-msg ai-answer">${answer}</div>`;
        aiContent.scrollTop = aiContent.scrollHeight;
    })
    .catch(err => {
        document.getElementById("aiLoading").remove();
        aiContent.innerHTML += `<div class="ai-msg ai-system">服务繁忙，请稍后再试</div>`;
        console.error(err);
    });
}

// 点击遮罩层关闭弹窗
document.getElementById("aiMask").onclick = toggleAIDialog;