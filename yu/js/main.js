// 轮播图核心逻辑
let slideIndex = 0;
let slides = [];
let dots = [];
let interval;

// 页面加载完成后初始化轮播
window.onload = function() {
    slides = document.querySelectorAll('.slide');
    dots = document.querySelectorAll('.dot');
    showSlides(slideIndex);
    autoSlide();
    // 轮播图鼠标悬停暂停/恢复
    const banner = document.querySelector('.banner');
    banner.addEventListener('mouseenter', () => clearInterval(interval));
    banner.addEventListener('mouseleave', autoSlide);
}

// 显示指定轮播图
function showSlides(n) {
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;
    document.querySelector('.banner-slides').style.transform = `translateX(${-slideIndex * 100}%)`;
    // 更新指示器状态
    dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === slideIndex) dot.classList.add('active');
    });
}

// 上一张
function prevSlide() {
    slideIndex--;
    showSlides(slideIndex);
}

// 下一张
function nextSlide() {
    slideIndex++;
    showSlides(slideIndex);
}

// 跳转到指定轮播图
function currentSlide(n) {
    slideIndex = n;
    showSlides(slideIndex);
}

// 自动轮播（5秒/次）
function autoSlide() {
    interval = setInterval(() => {
        nextSlide();
    },5000);
}

// 收藏和订单数据存储
let collectData = [];
let orderData = [];

// 页面切换逻辑
function showPage(page) {
    document.getElementById('index-page').style.display = 'none';
    document.getElementById('detail-page').style.display = 'none';
    document.getElementById('user-page').style.display = 'none';
    
    if (page === 'index' || page === 'category') {
        document.getElementById('index-page').style.display = 'block';
    } else if (page === 'user') {
        document.getElementById('user-page').style.display = 'block';
        renderCollect();
        renderOrder();
    }
}

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
}

// 添加收藏
function addCollect() {
    const title = window.currentDetailTitle;
    if (!collectData.includes(title)) {
        collectData.push(title);
        alert(`已收藏【${title}】`);
    } else {
        alert(`【${title}】已在收藏列表中`);
    }
}

// 模拟下单
function addOrder() {
    const title = window.currentDetailTitle;
    const orderNo = 'ORD' + Date.now().toString().slice(-6);
    orderData.push({
        orderNo: orderNo,
        product: title,
        time: new Date().toLocaleString()
    });
    alert(`模拟下单成功！订单号：${orderNo}`);
}

// 渲染收藏列表
function renderCollect() {
    const list = document.getElementById('collect-list');
    if (collectData.length === 0) {
        list.innerHTML = '<div class="collect-item">暂无收藏，请先添加</div>';
        return;
    }
    list.innerHTML = '';
    collectData.forEach(item => {
        list.innerHTML += `<div class="collect-item">
            <span>${item}</span>
            <button class="btn" style="padding: 5px 10px; font-size: 14px;" onclick="removeCollect('${item}')">取消收藏</button>
        </div>`;
    });
}

// 取消收藏
function removeCollect(item) {
    collectData = collectData.filter(i => i !== item);
    renderCollect();
    alert(`已取消收藏【${item}】`);
}

// 渲染订单列表
function renderOrder() {
    const list = document.getElementById('order-list');
    if (orderData.length === 0) {
        list.innerHTML = '<div class="order-item">暂无订单，请先下单</div>';
        return;
    }
    list.innerHTML = '';
    orderData.forEach(item => {
        list.innerHTML += `<div class="order-item">
            <div>
                <span>订单号：${item.orderNo}</span><br>
                <span>商品：${item.product}</span><br>
                <span>时间：${item.time}</span>
            </div>
            <span style="color: #f39c12;">模拟交易完成</span>
        </div>`;
    });
}