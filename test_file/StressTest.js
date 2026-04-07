import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  const url = 'http://localhost:3001/auth/student/login';
  const payload = JSON.stringify({
    studentId: 'S1230',
    icNumber: '010203040500',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(url, payload, params);

  console.log(res.status, res.body); // <-- Debug output

  check(res, {
    'status is success': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}
