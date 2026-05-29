async function testDashboard() {
    try {
        console.log('--- Testing /api/DonHang ---');
        const resDH = await fetch('http://localhost:5000/api/DonHang');
        console.log('DonHang Status:', resDH.status);

        console.log('--- Testing /api/dashboard/stats ---');
        const res = await fetch('http://localhost:5000/api/dashboard/stats');
        console.log('Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Data:', JSON.stringify(data, null, 2));
        } else {
            const text = await res.text();
            console.log('Error Body:', text.substring(0, 200));
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

testDashboard();
