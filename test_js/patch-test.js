import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://spring-app:8080';

export const options = {
  stages: [
    { duration: '30s', target: 15 },
    { duration: '10s', target: 0 },
  ],
};

// 테스트 시작 전, 수정할 게시글 1개를 미리 생성합니다.
export function setup() {
  console.log('--- PATCH 테스트를 위한 데이터 생성 ---');
  const res = http.post(`${BASE_URL}/posts`, JSON.stringify({ title: 'Original Title' }), { headers: { 'Content-Type': 'application/json' } });
  const postId = res.json('id');
  return { postID: postId };
}

// 가상 사용자는 매번 다른 내용으로 같은 게시글의 제목을 수정합니다.
export default function (data) {
  const patchPayload = JSON.stringify({
    title: `Patched Title by VU ${__VU} Iter ${__ITER}`,
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.patch(`${BASE_URL}/posts/${data.postID}`, patchPayload, params);

  check(res, {
    'PATCH /posts/{id} status is 200': (r) => r.status === 200,
    'patched title is correct': (r) => r.json('title').includes('Patched Title'),
  });

  sleep(1);
}

// 테스트 종료 후, 생성했던 데이터를 삭제합니다.
export function teardown(data) {
  console.log('--- PATCH 테스트 데이터 삭제 ---');
  http.del(`${BASE_URL}/posts/${data.postID}`);
}