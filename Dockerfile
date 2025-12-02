# Node.js 20 베이스 이미지 사용
FROM node:20-slim

# Python 3 및 필요한 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# pnpm 활성화
RUN corepack enable

# package.json과 pnpm-lock.yaml 복사
COPY package.json pnpm-lock.yaml* ./

# Node.js 의존성 설치
RUN pnpm install --frozen-lockfile

# requirements.txt 복사 및 Python 의존성 설치
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN pnpm run build

# 포트 노출
EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1

# 애플리케이션 시작
CMD ["pnpm", "start"]

