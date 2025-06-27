import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://spring-app:8080';

export const options = {
  stages: [
    { duration: '30s', target: 15 },
    { duration: '10s', target: 0 },
  ],
};

// 이 테스트는 매 반복이 독립적이므로 setup/teardown이 필요 없습니다.
export default function () {
  // 1. 삭제할 데이터를 먼저 생성합니다.
  const postPayload = JSON.stringify({ title: 'To Be Deleted', content: '...' });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const postRes = http.post(`${BASE_URL}/posts`, postPayload, params);

  const postId = postRes.json('id');
  if (!check(postRes, { 'DELETE-TEST: post created': (r) => r.status === 201 && postId })) {
    return; // 생성에 실패하면 이번 반복은 중단
  }

  // 2. 생성된 ID가 있을 경우에만 삭제를 진행합니다.
  sleep(0.5); // 아주 짧은 대기
  const deleteRes = http.del(`${BASE_URL}/posts/${postId}`);
  check(deleteRes, {
    'DELETE /posts/{id} status is 204': (r) => r.status === 204 // 204 No Content 확인
  });

  sleep(1);
}