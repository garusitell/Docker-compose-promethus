import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://spring-app:8080';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, //\\\
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const postPayload = JSON.stringify({
    title: `Create Test - VU ${__VU}, Iter ${__ITER}`,
    content: 'This is a post created during a create-focused load test.',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/posts`, postPayload, params);

  check(res, {
    'POST /posts status is 201': (r) => r.status === 201, // 201 Created 확인
  });

  sleep(1);
}