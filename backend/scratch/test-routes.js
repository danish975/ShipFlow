const API_URL = 'http://localhost:5000/api/v1';

async function testRoutes() {
  console.log('Testing ShipFlow API Routes...');
  
  // 1. Health Check
  try {
    const healthRes = await fetch('http://localhost:5000/health');
    const health = await healthRes.json();
    console.log('✅ Health check passed:', health);
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
    return;
  }

  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123'
  };

  let token = '';

  // 2. Register
  try {
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regData = await regRes.json();
    if (regRes.ok) {
      console.log('✅ Registration passed:', regData.data.user.email);
      token = regData.data.token;
    } else {
      console.error('❌ Registration failed:', regData);
    }
  } catch (err) {
    console.error('❌ Registration request failed:', err.message);
  }

  // 3. Login
  if (!token) {
    try {
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        console.log('✅ Login passed');
        token = loginData.data.token;
      } else {
        console.error('❌ Login failed:', loginData);
      }
    } catch (err) {
      console.error('❌ Login request failed:', err.message);
    }
  }

  if (!token) {
    console.error('❌ Cannot continue without token');
    return;
  }

  // 4. Create Shipment
  let shipmentId = '';
  try {
    const shipmentPayload = {
      trackingNumber: `TRK-${timestamp}`,
      origin: {
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      destination: {
        address: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-123-4567'
      },
      packageDetails: {
        weight: 10,
        dimensions: { length: 12, width: 12, height: 12, unit: 'in' }
      },
      priority: 'STANDARD'
    };

    const createRes = await fetch(`${API_URL}/shipments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(shipmentPayload)
    });
    const createData = await createRes.json();
    if (createRes.ok) {
      console.log('✅ Create shipment passed:', createData.data._id);
      shipmentId = createData.data._id;
    } else {
      console.error('❌ Create shipment failed:', createData);
    }
  } catch (err) {
    console.error('❌ Create shipment request failed:', err.message);
  }

  // 5. Get Shipments
  try {
    const getRes = await fetch(`${API_URL}/shipments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getData = await getRes.json();
    if (getRes.ok) {
      console.log(`✅ Get shipments passed. Found ${getData.data.length} shipments.`);
    } else {
      console.error('❌ Get shipments failed:', getData);
    }
  } catch (err) {
    console.error('❌ Get shipments request failed:', err.message);
  }
}

testRoutes();
