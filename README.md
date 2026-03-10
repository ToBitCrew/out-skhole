# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# OutSkhole

대학생 전용 크로스캠퍼스 커뮤니티 + 전공 마켓플레이스
에타처럼 학교 울타리에 갇히지 않고, 전공별로 다른 학교 학생들과 소통하고 전공책/실습도구를 거래하는 앱

🎓 커뮤니티 측면

- 전공별 Q&A 게시판 — "컴공 과제 막히면 다른 학교 선배한테도 질문 가능"
- 강의/교수 후기 공유 — 타 학교 같은 과목 수강 후기 비교 (수강신청에 도움)
- 팀 프로젝트 팀원 구하기 — 해커톤, 공모전 팀원을 타 학교까지 범위 확장

📚 마켓 측면

- 전공책 상태 등급제 — 사진 + 필기 여부 + 등급(S/A/B)으로 신뢰도 향상
- 학교/과 기반 필터링 — "컴공 2학년 책만 보기" 같은 정밀 필터
- 나눔 기능 — 돈 받기 애매한 책을 무료 나눔으로 올리기
- 단체 구매 - 책 등등 단체 구매를 통해 할인을 받기

🔐 학생 인증 (핵심 차별점)

- 대학 이메일 인증 한 번으로 통합 — @~.ac.kr 인증으로 모든 기능 개방
- 인증된 학교/학과 정보가 프로필에 뱃지로 표시

## 기술 스택

- 프론트엔드: React Expo, Android, iOS, 웹 멀티 플렛폼
- 백엔드: NodeJS
- DBMS: MariaDB

| **항목**         | **제안**                         |
| ---------------- | -------------------------------- |
| 실시간 채팅      | Socket.io (Node.js랑 궁합 좋음)  |
| 이미지 업로드    | AWS S3 or Cloudinary (무료 플랜) |
| 학교 이메일 인증 | Nodemailer + OTP                 |
| 검색 기능        | MariaDB FULLTEXT 인덱스          |
