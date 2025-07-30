// test-add-card.js
// 用于测试新增卡片接口

async function testAddCard() {
    const card = {
        card_number: "1234567890123451",
        bank_name: "Test Bank",
        balance: 9999
    };
    try {
        const res = await fetch('http://localhost:3000/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(card)
        });
        if (!res.ok) {
            const err = await res.json();
            console.error('添加失败:', err);
            alert('添加失败: ' + (err.error || res.status));
            return;
        }
        const data = await res.json();
        console.log('添加成功:', data);
        alert('添加成功: ' + JSON.stringify(data));
    } catch (e) {
        console.error('请求出错:', e);
        alert('请求出错: ' + e.message);
    }
}

// 立即执行测试
window.testAddCard = testAddCard;
