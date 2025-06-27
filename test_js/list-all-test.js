import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://spring-app:8080';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // 더 많은 사용자로 조회 테스트
    { duration: '10s', target: 0 },
  ],
};

// 테스트 시작 전, 조회할 데이터 50개를 미리 생성합니다.
export function setup() {
  console.log('--- 전체 조회 테스트를 위한 데이터 50개 생성 ---');
  const postIds = [];
  for (let i = 0; i < 50; i++) {
    const res = http.post(`${BASE_URL}/posts`, JSON.stringify({ title: `List Test Post ${i}` }), { headers: { 'Content-Type': 'application/json' } });
    if(res.status === 201) postIds.push(res.json('id'));
  }
  console.log('--- 데이터 생성 완료 ---');
  return { postIDs: postIds };
}

// 가상 사용자는 전체 목록 조회만 반복합니다.
export default function () {
  const res = http.get(`${BASE_URL}/posts`);
  check(res, {
    'GET /posts status is 200': (r) => r.status === 200,
    'response is an array with 50 items': (r) => r.json().length >= 50,
  });
  sleep(1);
}

// 테스트 종료 후, 생성했던 데이터를 삭제합니다.
export function teardown(data) {
  console.log('--- 전체 조회 테스트 데이터 삭제 ---');
  for (const id of data.postIDs) {
    http.del(`${BASE_URL}/posts/${id}`);
  }
  console.log('--- 데이터 삭제 완료 ---');
}