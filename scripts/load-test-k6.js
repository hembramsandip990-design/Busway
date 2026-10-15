import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up to 50 concurrent commuters
    { duration: '1m', target: 200 },  // Peak corridor rush (200 concurrent users)
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests must complete below 300ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

const BASE_URL = __ENV.APP_URL || 'http://localhost:3000/api/v1';

export default function () {
  // 1. Search trips on corridor
  const searchRes = http.get(`${BASE_URL}/trips/search?origin=Bally&destination=Sector%20V`);
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'routes returned': (r) => r.json().length > 0,
  });

  sleep(1);

  // 2. Request capacity hold
  const payload = JSON.stringify({
    tripId: 'trip_bally_0830',
    passengerCount: 1,
  });

  const holdRes = http.post(`${BASE_URL}/bookings/holds`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(holdRes, {
    'hold status is 201 or 409 (capacity bounded)': (r) => r.status === 201 || r.status === 409,
  });

  sleep(1);
}
