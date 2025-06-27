import http from 'k6/http';
import { check, sleep } from 'k6';

// 테스트 옵션 설정
export const options = {
  // 'stages'는 시간에 따라 가상 사용자(VU) 수를 조절하여 부하 패턴을 정의합니다.
  stages: [
    { duration: '30s', target: 20 }, // 30초 동안 사용자를 0명에서 20명까지 서서히 늘립니다 (Ramp-up)
    { duration: '1m', target: 20 },  // 1분 동안 사용자 20명을 유지합니다 (Sustained load)
    { duration: '10s', target: 0 },  // 10초 동안 사용자를 20명에서 0명으로 서서히 줄입니다 (Ramp-down)
  ],
  // 테스트 실패 조건을 설정합니다.
  thresholds: {
    'http_req_failed': ['rate<0.01'], // HTTP 실패율이 1% 미만이어야 함
    'http_req_duration': ['p(95)<200'], // 요청의 95%는 200ms 안에 처리되어야 함
  },
};

// Docker Compose 네트워크 내에서 spring-app 서비스에 접근하기 위한 기본 URL
const BASE_URL = 'http://spring-app:8080';

// k6 테스트의 메인 로직. 각 가상 사용자가 이 함수를 반복적으로 실행합니다.
export default function () {
  // --- 1. 새로운 게시글 생성 (POST 요청) ---
  const postPayload = JSON.stringify({
    title: `k6 test post by VU ${__VU} iter ${__ITER}`, // 각 요청마다 고유한 제목 생성
    content: 'This is a test post created by k6. It can contain a long text.',
  });

  const postParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const postRes = http.post(`${BASE_URL}/posts`, postPayload, postParams);

  // POST 요청 결과 검증
  check(postRes, {
    'POST /posts status is 200': (r) => r.status === 200,
    'POST /posts response has id': (r) => r.json('id') !== null,
  });

  // 응답으로 받은 JSON에서 생성된 게시글의 ID를 추출합니다.
  const postId = postRes.json('id');

  // ID가 성공적으로 추출되었을 경우에만 다음 단계를 진행합니다.
  if (postId) {
    // 실제 사용자가 글을 작성하고 잠시 쉬는 것을 시뮬레이션
    sleep(1);

    // --- 2. 생성된 ID를 이용해 게시글 조회 (GET 요청) ---
    const getRes = http.get(`${BASE_URL}/posts/${postId}`);

    // GET 요청 결과 검증
    check(getRes, {
      'GET /posts/{id} status is 200': (r) => r.status === 200,
      'GET /posts/{id} body has correct id': (r) => r.json('id') === postId,
    });
  }

  // 다음 반복을 위해 1~2초간 대기
  sleep(1);
}