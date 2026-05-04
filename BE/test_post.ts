async function testPost() {
    try {
        const res = await fetch('http://localhost:5000/api/PhieuGiaoHang', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ma_don_hang: 1,
                ma_shipper: 10,
                trang_thai_giao: 'DANG_VAN_CHUYEN'
            })
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Body:', text);
        try {
            const data = JSON.parse(text);
            console.log('Response JSON:', data);
        } catch (e) {
            console.log('Response is not JSON');
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testPost();
