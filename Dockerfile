FROM openjdk:17-jdk-slim as build

WORKDIR /workspace/app
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY src src

RUN chmod +x ./gradlew && ./gradlew build -x test

FROM openjdk:17-jdk-slim
# ======================================================= #
# <<< ⭐ healthcheck를 위한 curl 설치 코드 추가! ⭐ >>>
# apt-get을 root 권한으로 실행하고, curl을 설치한 뒤, 불필요한 캐시를 삭제합니다.
USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
# ======================================================= #

VOLUME /tmp
ARG JAR_FILE=/workspace/app/build/libs/*.jar
COPY --from=build ${JAR_FILE} app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]